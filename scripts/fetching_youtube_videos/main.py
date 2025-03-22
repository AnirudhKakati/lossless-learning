import json
import pandas as pd
from googleapiclient.discovery import build
from google.cloud import storage
from google.cloud import secretmanager
import functions_framework

# secret manager and storage client setup
secret_client=secretmanager.SecretManagerServiceClient()
storage_client=storage.Client()


def get_youtube_api_key(project_id,secret_id,version_id="latest"):
    """
    Retrieve the YouTube API key from Google Secret Manager.

    Args:
        project_id (str): Google Cloud project ID where the secret is stored.
        secret_id (str): ID of the secret containing the API key.
        version_id (str, optional): Version of the secret to access. Defaults to "latest".

    Returns:
        str: Decoded YouTube API key as a string.
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
    

def fetch_youtube_videos(domain, bucket_name, topics_file_path, output_folder, project_id, secret_id="youtube-api-key", max_results=4):
    """
    Fetch YouTube video metadata for all topics under a specific domain and save the data as a JSON file to GCS.

    Args:
        domain (str): Top-level domain (e.g., "Machine Learning") to fetch videos for.
        bucket_name (str): Name of the GCS bucket containing the topics file and where output will be saved.
        topics_file_path (str): Path to the JSON file listing topics, organized by domain and subdomain.
        output_folder (str): Folder in GCS where the result JSON file will be saved.
        project_id (str): Google Cloud project ID used to access the Secret Manager.
        secret_id (str, optional): Secret ID for the YouTube API key. Defaults to "youtube-api-key".
        max_results (int, optional): Maximum number of videos to fetch per topic. Defaults to 4.

    Returns:
        str: Success message with domain and output file path.
    """

    api_key=get_youtube_api_key(project_id,secret_id) # get API key from Secret Manager
    youtube=build("youtube", "v3", developerKey=api_key) # build YouTube API client
    topics_json=get_topics_json(bucket_name, topics_file_path) # get topics data from GCS
    
    records=[]
    columns="Domain,Sub Domain,Topic,Video Title,URL,Thumbnail,ID,Publish Time,Channel,Channel ID".split(",")
    
    subdomains=list(topics_json[domain].keys()) #for every subdomain
    for subdomain in subdomains:
        print(f"Fetching data for {subdomain}")
        topics=list(topics_json[domain][subdomain].keys()) #get the topics
        
        for topic in topics: #then fetch videos for every topic
            request=youtube.search().list(part="snippet",q=topic,maxResults=max_results,type="video",safeSearch="strict",relevanceLanguage="en")

            response=request.execute()
            response=response["items"]
            
            for i in range(len(response)):
                data=response[i]
    
                title=data["snippet"]["title"]
                video_id=data['id']['videoId']
                url=f"https://www.youtube.com/watch?v={video_id}"
                thumbnail=data['snippet']['thumbnails']['high']['url']
                publish_time=data['snippet']['publishTime']
                channel=data['snippet']['channelTitle']
                channel_id=data['snippet']['channelId']
                    
                record=[domain, subdomain, topic, title, url, thumbnail, video_id, publish_time, channel, channel_id]
                records.append(record)
                
        print(f"Fetched data for {subdomain}")
    
    print(f"Successfully fetched YouTube videos for domain: {domain}")
    
    df=pd.DataFrame(records, columns=columns) # create DataFrame and convert to JSON
    file_name=f"{output_folder}/{domain.lower().replace(' ', '_')}_youtube_videos.json"
    json_data=df.to_json(orient="records", indent=4)
    
    save_data_to_bucket(bucket_name, file_name, json_data) # upload JSON to bucket
    
    return f"Processed domain: {domain}, saved to {file_name}"

@functions_framework.http
def youtube_data_fetcher(request):
    """
    HTTP-triggered Cloud Function to fetch YouTube video metadata for a given domain and store it in GCS.

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
    default_output_folder="fetched_videos"
    default_secret_id="youtube-api-key"
    
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
        result=fetch_youtube_videos(domain=domain,bucket_name=bucket_name,topics_file_path=topics_file_path,output_folder=output_folder,
                                    project_id=project_id,secret_id=secret_id)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500