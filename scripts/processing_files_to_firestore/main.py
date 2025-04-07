import json
from google.cloud import storage
from google.cloud import firestore
import functions_framework
import hashlib

def get_jsons_from_bucket(bucket_name,resource_type):
    """
    Fetch and parse JSON records from a Google Cloud Storage bucket based on the resource type.

    Handles multi-record JSON arrays as well as single-record JSON files. Filters out
    irrelevant files and applies special filtering for video transcript files.

    Args:
        bucket_name (str): Name of the GCS bucket containing the JSON files.
        resource_type (str): Type of resource to fetch (e.g., "articles", "videos", "github_repos").

    Returns:
        list: A list of parsed JSON records extracted from the matched files.
    """

    storage_client=storage.Client()
    bucket=storage_client.bucket(bucket_name)
    blob_path=f"fetched_{resource_type}"

    try:
        blobs=bucket.list_blobs(prefix=blob_path)
    except Exception as e:
        raise RuntimeError(f"Failed to list blobs from bucket '{bucket_name}': {e}")

    all_records=[]

    for blob in blobs:
        if not blob.name.endswith('.json') or blob.name.endswith('/'): #if not a json file then we skip
            continue
        # for videos we select the "with_transcripts" jsons
        if resource_type=="videos" and not blob.name.endswith('transcripts.json'): 
            continue
        try:
            data=json.loads(blob.download_as_string())
        except Exception as e:
            print(f"Skipping blob {blob.name} due to error: {e}")
            continue

        if isinstance(data, list): #extend the json records to the all_records list
            all_records.extend(data)
        elif isinstance(data, dict): #if only single record then append it
            all_records.append(data)
        else:
            print(f"Invalid JSON structure in {blob.name}, skipping.")
    
    return all_records


def add_to_firestore(bucket_name,resource_type):
    """
    Load records from GCS and insert them into Firestore with deduplication based on resource URL.

    Adds a "resource_type" field to each record, standardizes key format, and uses a hash of
    the record URL as the Firestore document ID to avoid duplicates.

    Args:
        bucket_name (str): Name of the GCS bucket containing the resource files.
        resource_type (str): Type of resource being inserted (e.g., "articles", "videos", "github_repos").

    Returns:
        str: A summary message with the number of records added to Firestore.
    """

    db = firestore.Client()

    try:
        all_records=get_jsons_from_bucket(bucket_name,resource_type) #get the combined json records of the resource type
    except Exception as e:
        raise RuntimeError(f"Error fetching records from GCS: {e}")
    
    count_records=0
    for record in all_records:
        try:
            record["resource_type"]=resource_type #add a resource type key to the record
            record={"_".join(k.lower().split()): v for k, v in record.items()} #convert each key to lower case with _ separator

            unique_key=record.get("link") or record.get("url") or record.get("repo_url") #get the unique key based on the link/url
            #for articles it is stored in key "link", "url" for videos and "repo_url" for github repos

            if not unique_key:
                print("Skipping record with no unique identifier")
                continue
            
            article_id = hashlib.md5(unique_key.encode()).hexdigest() #create a hash key using the url of the record. This will become the id of the record
            # in Firestore DB. This prevents duplicate records getting created in the DB for the same record 
            doc_ref=db.collection("resources").document(article_id) #add it to the collection "records"
            doc_ref.set(record)

            count_records+=1 #keep count of records

        except Exception as e:
            print(f"Error adding record to Firestore: {e}")
            continue
    
    return f"Completed adding {count_records} out of {len(all_records)} for resource type : {resource_type} to Firestore"


@functions_framework.http
def firestore_data_processor(request):
    """
    HTTP-triggered Cloud Function to process and insert resource metadata into Firestore.

    Fetches resource records from a GCS bucket based on the specified resource type,
    cleans and standardizes them, and uploads them to the "resources" Firestore collection.

    Expects a JSON payload or query parameters with at least the 'resource_type'.
    Optional parameter: 'bucket_name'.

    Args:
        request (flask.Request): The HTTP request object containing JSON or query parameters.

    Returns:
        tuple: A response string and HTTP status code.
    """

    request_json=request.get_json(silent=True)
    request_args=request.args

    # set default values
    default_bucket="lossless-learning"

    # extract parameters with defaults
    if request_json:
        bucket_name=request_json.get('bucket_name', default_bucket)
        resource_type=request_json.get('resource_type')
    elif request_args:
        bucket_name=request_args.get('bucket_name', default_bucket)
        resource_type=request_args.get('resource_type')
    else:
        return "Error: Please provide request parameters", 400

    # validate required parameters
    if not resource_type:
        return "Error: Please provide a 'resource_type' parameter", 400
    
    try:
        result=add_to_firestore(bucket_name,resource_type)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500
