from google.cloud import storage
import json
import hashlib
import functions_framework
import csv
import io

def save_summaries(bucket_name,blob_path,output_path,csv_output_path):
    """
    Process video summary JSON files from GCS, save individual summaries as text files,
    and generate a CSV mapping each text file to its source video URL.

    Args:
        bucket_name (str): Name of the GCS bucket containing the summary JSONs.
        blob_path (str): Prefix path within the bucket where summary JSONs are stored.
        output_path (str): Path in the bucket where individual text files will be saved.
        csv_output_path (str): Path in the bucket where the summary-to-URL mapping CSV will be stored.

    Returns:
        str: Success message on completion.

    Raises:
        RuntimeError: If any error occurs during GCS access or file operations.
    """

    try:
        storage_client=storage.Client()
        bucket=storage_client.bucket(bucket_name)
    except Exception as e:
        raise RuntimeError(f"Failed to connect to bucket : {bucket_name}: {str(e)}")

    
    records=get_jsons_from_bucket(bucket,blob_path)
    csv_records=[]

    for record in records:
        summary=record["Summary"]
        resource_id=hashlib.md5(record["URL"].encode()).hexdigest()
        url=record["URL"]
        
        output_filename=f"{resource_id}.txt"
    
        save_summary_txt_to_gcs(summary,bucket,output_path,output_filename)
        
        csv_records.append((output_filename,url))
    
    save_csv_to_gcs(csv_records,bucket,csv_output_path)

    return "Successfully processed summaries"

def get_jsons_from_bucket(bucket,blob_path):
    """
    Retrieve and parse JSON blobs ending with 'summaries.json' from a specified GCS path.

    Args:
        bucket (google.cloud.storage.bucket.Bucket): GCS bucket object.
        blob_path (str): Prefix path to search for JSON blobs.

    Returns:
        list: A list of parsed JSON records.

    Raises:
        RuntimeError: If blob listing fails.
    """

    try:
        blobs=bucket.list_blobs(prefix=blob_path)
    except Exception as e:
        raise RuntimeError(f"Failed to list blobs from bucket : {e}")
    
    all_records=[]

    for blob in blobs:
        if not blob.name.endswith('.json') or blob.name.endswith('/'): #if not a json file then we skip
            continue
        # we select the "with_transcripts_and_summaries" jsons
        if not blob.name.endswith('summaries.json'): 
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

def save_summary_txt_to_gcs(summary,bucket,output_path,output_filename):
    """
    Upload a summary string as a text file to GCS.

    Args:
        summary (str): Text content to save.
        bucket (google.cloud.storage.bucket.Bucket): GCS bucket object.
        output_path (str): Path within the bucket where the file will be saved.
        output_filename (str): Name of the output file.

    Raises:
        RuntimeError: If upload fails.
    """

    try:
        blob=bucket.blob(f"{output_path}/{output_filename}")
        blob.upload_from_string(summary, content_type="text/plain")
    except Exception as e:
        raise RuntimeError(f"Failed to save summary file {output_filename}: {str(e)}")


def save_csv_to_gcs(csv_records,bucket,csv_output_path):
    """
    Create and upload a CSV mapping summary text filenames to their source URLs.

    Args:
        csv_records (list): List of (filename, url) tuples.
        bucket (google.cloud.storage.bucket.Bucket): GCS bucket object.
        csv_output_path (str): Path in the bucket where the CSV will be stored.
    """

    output=io.StringIO()
    writer=csv.writer(output)
    
    writer.writerow(['filename', 'url']) #write header
    writer.writerows(csv_records) #write data rows

    #upload to GCS
    blob=bucket.blob(f"{csv_output_path}/summaries_filename_url_mapping.csv")
    blob.upload_from_string(output.getvalue(), content_type="text/csv")

@functions_framework.http
def summaries_processor(request):
    """
    HTTP Cloud Function to process video summaries and generate text files and CSV mappings in GCS.

    Accepts a JSON payload or query parameters with optional customization of bucket and paths.

    Args:
        request (flask.Request): The incoming HTTP request object.

    Returns:
        tuple: A success message and HTTP status code 200, or error message and status code 500.
    """

    request_json=request.get_json(silent=True)
    request_args=request.args

    # set default values
    default_bucket="lossless-learning"
    default_blob_path="fetched_videos"
    default_output_path="video_summaries"
    default_csv_output_path="summaries_filename_url_mapping"

    # extract parameters with defaults
    if request_json:
        bucket_name=request_json.get('bucket_name', default_bucket)
        blob_path=request_json.get('blob_path', default_blob_path)
        output_path=request_json.get('output_path', default_output_path)
        csv_output_path=request_json.get('csv_output_path', default_csv_output_path)
    elif request_args:
        bucket_name=request_args.get('bucket_name', default_bucket)
        blob_path=request_args.get('blob_path', default_blob_path)
        output_path=request_args.get('output_path', default_output_path)
        csv_output_path=request_args.get('csv_output_path', default_csv_output_path)

    try:
        result=save_summaries(bucket_name,blob_path,output_path,csv_output_path)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500