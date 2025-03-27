import json
import pandas as pd
from google.cloud import storage
from google.cloud import secretmanager
import functions_framework
import requests
import time

# secret manager and storage client setup
secret_client=secretmanager.SecretManagerServiceClient()
storage_client=storage.Client()


def get_github_access_token(project_id,secret_id,version_id="latest"):
    """
    Retrieve the Github Access Token from Google Secret Manager.

    Args:
        project_id (str): Google Cloud project ID where the secret is stored.
        secret_id (str): ID of the secret containing the Access Token.
        version_id (str, optional): Version of the secret to access. Defaults to "latest".

    Returns:
        str: Decoded Github Access Token as a string.
    """

    secret_name=f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response=secret_client.access_secret_version(name=secret_name)
    return response.payload.data.decode("UTF-8")


def get_topics_json(bucket_name, blob_path):
    """
    Download and parse a JSON file containing topics from Google Cloud Storage.

    Args:
        bucket_name (str): Name of the GCS bucket.
        blob_path (str): Path to the JSON file in the bucket.

    Returns:
        dict: Parsed JSON content as a Python dictionary.
    """

    bucket=storage_client.bucket(bucket_name)
    blob=bucket.blob(blob_path)
    content=blob.download_as_text()
    return json.loads(content)


def save_data_to_bucket(bucket_name, blob_path, data):
    """
    Upload data to a specified path in a Google Cloud Storage bucket.

    Args:
        bucket_name (str): Name of the GCS bucket.
        blob_path (str): Path within the bucket where the data will be saved.
        data (str): String content to upload, typically in JSON format.

    Returns:
        None
    """

    bucket=storage_client.bucket(bucket_name)
    blob=bucket.blob(blob_path)
    blob.upload_from_string(data, content_type="application/json")
    print(f"Uploaded data to {blob_path}")


def fetch_github_repos(domain, bucket_name, topics_file_path, output_folder, project_id, secret_id="github-access-token", max_results=5):
    """
    Fetch Github repos for all topics under a specific domain and save the data as a JSON file to GCS.

    Args:
        domain (str): Top-level domain (e.g., "Machine Learning") to fetch repos for.
        bucket_name (str): Name of the GCS bucket containing the topics file and where output will be saved.
        topics_file_path (str): Path to the JSON file listing topics, organized by domain and subdomain.
        output_folder (str): Folder in GCS where the result JSON file will be saved.
        project_id (str): Google Cloud project ID used to access the Secret Manager.
        secret_id (str, optional): Secret ID for the Github Access Token. Defaults to "github-access-token".
        max_results (int, optional): Maximum number of repos to fetch per topic. Defaults to 5.

    Returns:
        str: Success message with domain and output file path.
    """

    access_token=get_github_access_token(project_id, secret_id) # get API key from Secret Manager
    topics_json=get_topics_json(bucket_name, topics_file_path) # get topics data from GCS
    
    records=[]
    columns="Domain,Sub Domain,Topic,Repo ID,Repo Name,Repo URL,Repo Stars".split(",")
    
    # initialize rate limit tracking
    remaining_requests=30  # GitHub search API limit per minute
    reset_time=time.time() + 60  # initialize with 1 minute from now
    
    subdomains = list(topics_json[domain].keys()) #for every subdomain
    for subdomain in subdomains:
        print(f"Fetching data for {subdomain}")
        topics=list(topics_json[domain][subdomain].keys()) #get the topics
        for topic in topics: #then fetch github repos for every topic
            if remaining_requests<=0: # check if we need to wait for rate limit reset
                wait_time=max(0,reset_time-time.time())
                if wait_time>0:
                    print(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                    time.sleep(wait_time)
                # reset our counters
                remaining_requests=30
                reset_time=time.time()+60
            
            #call the search function
            repos,rate_info=search_github_repos(topic, access_token, max_results)
            
            #update rate limit information
            remaining_requests=rate_info['remaining']
            reset_time=rate_info['reset_time']
            
            # Process the results
            for repo in repos:
                repo_id = repo["id"]
                repo_name = repo["full_name"]
                repo_url = repo["html_url"]
                repo_stars = repo["stargazers_count"]

                record = [domain, subdomain, topic, repo_id, repo_name, repo_url, repo_stars]
                records.append(record)
                
        print(f"Fetched data for {subdomain}")
    
    print(f"Successfully fetched Github Repos for domain: {domain}")
    
    df=pd.DataFrame(records, columns=columns) # create DataFrame and convert to JSON
    file_name=f"{output_folder}/{domain.lower().replace(' ', '_')}_github_repos.json"
    json_data=df.to_json(orient="records", indent=4)
    
    save_data_to_bucket(bucket_name, file_name, json_data) # upload JSON to bucket
    
    return f"Processed domain: {domain}, saved to {file_name}"


def search_github_repos(query, access_token, per_page=5, max_retries=3):
    """
    Search GitHub repositories with rate limit handling and retries.
    
    Args:
        query (str): Search query for GitHub repositories.
        access_token (str): GitHub API access token.
        per_page (int): Number of results per page.
        max_retries (int): Maximum number of retry attempts.
        
    Returns:
        tuple: (list of repos, dict with rate limit info)
    """

    url="https://api.github.com/search/repositories"
    params={"q": query, "sort": "stars", "order": "desc", "per_page": per_page}
    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    
    for attempt in range(max_retries):
        try:
            response=requests.get(url, params=params, headers=headers)
            # extract rate limit info from headers
            remaining=int(response.headers.get('X-RateLimit-Remaining', 0))
            reset_timestamp=int(response.headers.get('X-RateLimit-Reset', 0))
            # rate_info={'remaining': remaining,'reset_time': reset_timestamp}

            current_time=time.time()
            wait_seconds=max(0, reset_timestamp-current_time)+1
            rate_info = {'remaining': remaining,'reset_time': current_time+wait_seconds}  # Store when we can resume
            
            if response.status_code==200:
                return response.json()['items'], rate_info
            elif response.status_code==403 and "rate limit exceeded" in response.json().get('message','').lower():
                wait_time = max(0, reset_timestamp-time.time())+1
                print(f"Rate limit exceeded. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
                # try again after waiting
                continue
            else:
                print(f"GitHub API error: {response.status_code}, {response.json()}")
                # return empty results but still with rate info
                return [], rate_info
                
        except Exception as e:
            print(f"Error fetching GitHub repos for '{query}': {str(e)}")
            if attempt==max_retries-1:
                # last attempt failed
                return [], {'remaining':0, 'reset_time':time.time()+60}
            time.sleep(2 ** attempt)  #exponential backoff
    
    # fallback
    return [], {'remaining':0,'reset_time':time.time()+60}

@functions_framework.http
def github_repo_fetcher(request):
    """
    HTTP-triggered Cloud Function to fetch Github Repos for a given domain and store it in GCS.

    Expects a JSON payload or query parameters with at least 'domain' and 'project_id'.
    Optional parameters include 'bucket_name', 'topics_file_path', 'output_folder', and 'secret_id'.

    Args:
        request (flask.Request): The HTTP request object containing JSON or query parameters.

    Returns:
        tuple: A response string and HTTP status code.
    """

    request_json=request.get_json(silent=True)
    request_args=request.args
    
    # set default values
    default_bucket="lossless-learning"
    default_topics_path="topics.json"
    default_output_folder="fetched_github_repos"
    default_secret_id="github-access-token"
    
    # extract parameters with defaults
    if request_json:
        domain=request_json.get('domain')
        bucket_name=request_json.get('bucket_name', default_bucket)
        topics_file_path=request_json.get('topics_file_path', default_topics_path)
        output_folder=request_json.get('output_folder', default_output_folder)
        project_id=request_json.get('project_id')
        secret_id=request_json.get('secret_id', default_secret_id)
    elif request_args:
        domain=request_args.get('domain')
        bucket_name=request_args.get('bucket_name', default_bucket)
        topics_file_path=request_args.get('topics_file_path', default_topics_path)
        output_folder=request_args.get('output_folder', default_output_folder)
        project_id=request_args.get('project_id')
        secret_id=request_args.get('secret_id', default_secret_id)
    else:
        return "Error: Please provide request parameters", 400
    
    # validate required parameters
    if not domain:
        return "Error: Please provide a 'domain' parameter", 400
    
    if not project_id:
        return "Error: Please provide a 'project_id' parameter", 400
    
    try:
        result=fetch_github_repos(domain=domain,bucket_name=bucket_name,topics_file_path=topics_file_path,output_folder=output_folder,
                                    project_id=project_id,secret_id=secret_id)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500
