import json
import pandas as pd
from googleapiclient.discovery import build
from google.cloud import storage
from google.cloud import secretmanager
import functions_framework

# secret manager and storage client setup
secret_client=secretmanager.SecretManagerServiceClient()
storage_client=storage.Client()

def get_secret(project_id,secret_id,version_id="latest"):
    """
    Retrieve the specified key (Custome Search Engine ID, Custom Search API Key) from Google Secret Manager.

    Args:
        project_id (str): Google Cloud project ID where the secret is stored.
        secret_id (str): ID of the secret containing the key.
        version_id (str, optional): Version of the secret to access. Defaults to "latest".

    Returns:
        str: Decoded key as a string.
    """

    secret_name=f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response=secret_client.access_secret_version(name=secret_name)
    return response.payload.data.decode("UTF-8")

def get_topics_json(bucket_name, blob_path):
    """
    Download and parse the JSON file containing topics from Google Cloud Storage.

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

def fetch_articles(domain, bucket_name, topics_file_path, output_folder, project_id, custom_search_api_secret_id="custom-search-api-key", search_engine_secret_id="custom-search-engine-id", max_results=8):
    """
    Fetch Google search article metadata for all topics under a specific domain and save the data as a JSON file to GCS.

    Args:
        domain (str): Top-level domain (e.g., "Machine Learning") to fetch articles for.
        bucket_name (str): Name of the GCS bucket containing the topics file and where output will be saved.
        topics_file_path (str): Path to the JSON file listing topics, organized by domain and subdomain.
        output_folder (str): Folder in GCS where the result JSON file will be saved.
        project_id (str): Google Cloud project ID used to access the Secret Manager.
        custom_search_api_secret_id (str, optional): Secret ID for the Custom Search API key. Defaults to "custom-search-api-key".
        search_engine_secret_id (str, optional): Secret ID for the Programmable Search Engine ID. Defaults to "custom-search-engine-id".
        max_results (int, optional): Maximum number of articles to fetch per topic. Defaults to 8.

    Returns:
        str: Success message indicating the processed domain and saved GCS file path.
    """

    custom_search_api_key=get_secret(project_id,custom_search_api_secret_id) # get API key from Secret Manager
    custom_search_engine_id=get_secret(project_id,search_engine_secret_id) # get custom search engine ID from Secret Manager

    search_service=build("customsearch","v1",developerKey=custom_search_api_key) # build Custom Search API client
    topics_json=get_topics_json(bucket_name, topics_file_path) # get topics data from GCS

    records=[]
    columns="Domain,Sub Domain,Topic,Title,Link,Snippet,Display Link".split(",")

    subdomains=list(topics_json[domain].keys()) #for every subdomain
    for subdomain in subdomains:
        print(f"Fetching data for {subdomain}")
        topics=list(topics_json[domain][subdomain].keys()) #get the topics

        for topic in topics: #then fetch articles for every topic
            results=search_topic(topic,search_service,custom_search_engine_id)
            if len(results)>0:
                for item in results:
                    title=item.get("title")
                    link=item.get("link")
                    snippet=item.get("snippet")
                    displayLink=item.get("displayLink")
                    records.append([domain,subdomain,topic,title,link,snippet,displayLink])

        print(f"Fetched data for {subdomain}")
    
    print(f"Successfully fetched articles for domain: {domain}")
    df=pd.DataFrame(records, columns=columns) # create DataFrame and convert to JSON
    file_name=f"{output_folder}/{domain.lower().replace(' ', '_')}_google_search_articles.json"
    json_data=df.to_json(orient="records", indent=4)
    
    save_data_to_bucket(bucket_name, file_name, json_data) # upload JSON to bucket
    
    return f"Processed domain: {domain}, saved to {file_name}"

def search_topic(topic,search_service,custom_search_engine_id,max_results=8):
    """
    Query the Google Custom Search API to fetch article results for a given topic.

    Args:
        topic (str): The topic to search for using the Custom Search API.
        search_service (googleapiclient.discovery.Resource): Authenticated Custom Search API client.
        custom_search_engine_id (str): Programmable Search Engine ID (CX) to use for the search.
        max_results (int, optional): Maximum number of search results to retrieve. Defaults to 8.

    Returns:
        list: A list of dictionaries containing search result metadata, or an empty list if no results found or error occurred.
    """

    try:
        response=search_service.cse().list(q=topic,cx=custom_search_engine_id,num=max_results).execute()
        if "items" in response:
            print(f"Fetched results for topic : {topic}")
            return response["items"]
        else:
            print(f"Could not fetch results for topic : {topic}")
            return []
    except Exception as e:
        print(f"Error fetching topic '{topic}': {str(e)}")
        return []

@functions_framework.http
def articles_fetcher(request):
    """
    HTTP-triggered Cloud Function to fetch articles through google search for a given domain and store it in GCS.

    Expects a JSON payload or query parameters with at least 'domain' and 'project_id'.
    Optional parameters include 'bucket_name', 'topics_file_path', 'output_folder', 'custom_search_api_secret_id' and 'search_engine_secret_id'.

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
    default_output_folder="fetched_articles"
    default_custom_search_api_secret_id="custom-search-api-key"
    default_search_engine_secret_id="custom-search-engine-id"

    # extract parameters with defaults
    if request_json:
        domain=request_json.get('domain')
        bucket_name=request_json.get('bucket_name', default_bucket)
        topics_file_path=request_json.get('topics_file_path', default_topics_path)
        output_folder=request_json.get('output_folder', default_output_folder)
        project_id=request_json.get('project_id')
        custom_search_api_secret_id=request_json.get('custom_search_api_secret_id', default_custom_search_api_secret_id)
        search_engine_secret_id=request_json.get('search_engine_secret_id', default_search_engine_secret_id)
    elif request_args:
        domain=request_args.get('domain')
        bucket_name=request_args.get('bucket_name', default_bucket)
        topics_file_path=request_args.get('topics_file_path', default_topics_path)
        output_folder=request_args.get('output_folder', default_output_folder)
        project_id=request_args.get('project_id')
        custom_search_api_secret_id=request_args.get('custom_search_api_secret_id', default_custom_search_api_secret_id)
        search_engine_secret_id=request_args.get('search_engine_secret_id', default_search_engine_secret_id)
    else:
        return "Error: Please provide request parameters", 400
    
    # validate required parameters
    if not domain:
        return "Error: Please provide a 'domain' parameter", 400
    
    if not project_id:
        return "Error: Please provide a 'project_id' parameter", 400
    
    try:
        result=fetch_articles(domain=domain,bucket_name=bucket_name,topics_file_path=topics_file_path,output_folder=output_folder,
                                    project_id=project_id,custom_search_api_secret_id=custom_search_api_secret_id,search_engine_secret_id=search_engine_secret_id)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500


