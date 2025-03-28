from google.cloud import storage
import json
import pandas as pd
from youtube_transcript_api import YouTubeTranscriptApi

client=storage.Client()
bucket_name="lossless-learning"
folder_path="fetched_videos/"
bucket=client.bucket(bucket_name)


def get_transcripts_for_videos(domain):
    """
    Fetches YouTube video transcripts for a specific domain from a JSON file stored in GCS,
    appends the transcripts to the original records, and uploads the updated data back to GCS.

    Args:
        domain (str): The topic domain name (e.g., "Linear Algebra", "Deep Learning").

    Returns:
        None
    """

    print(f"Fetching transcripts for : {domain}")
    domain="_".join(domain.lower().split())
    blobs=bucket.list_blobs(prefix=folder_path)

    for blob in blobs:
        if blob.name.endswith(f'{domain}_youtube_videos.json'):
            content=blob.download_as_text()
            try:
                data=json.loads(content)
            except json.JSONDecodeError:
                print(f"Couldn't parse {blob.name}")
                return
            
            all_records=[]
            for record in data:
                video_id=record["ID"]
                transcript_text=get_transcript(video_id)
                record["Transcript"]=transcript_text
                all_records.append(record)
                print(f"Completed video id : {video_id}")
            break
    else:
        print(f"No file found for domain: {domain}")
        return
    
    if not all_records:
        print(f"No records found for domain: {domain}")
        return

    df=pd.DataFrame(all_records)
    json_data=df.to_json(orient="records", indent=4)
    destination_blob_name=f"{folder_path}{domain}_youtube_videos_with_transcripts.json"
    save_data_to_bucket(destination_blob_name,json_data)
    print(f"Successfuly fetched transcripts for Domain : {domain}")


def get_transcript(video_id):
    """
    Retrieves the English transcript of a YouTube video using the YouTubeTranscriptApi.

    Args:
        video_id (str): The unique YouTube video ID.

    Returns:
        str: A single string containing the transcript text. Returns an empty string if unavailable.
    """

    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    except Exception as e:
        print(f"Error fetching transcript list for video {video_id}: {e}")
        return ""
    
    transcript_text=""
    for transcript in transcript_list:
        if (transcript.language_code=="en"):
            try:
                text=transcript.fetch("en").to_raw_data()
                text_formatted=[" ".join(x["text"].split()) for x in text]
                transcript_text=" ".join(text_formatted)
            except Exception as e:
                print(f"Error fetching transcript text for video {video_id}: {e}")
            break
        
    return transcript_text


def save_data_to_bucket(blob_path, data):
    """
    Uploads data (in JSON format) to a specified path in a Google Cloud Storage bucket.

    Args:
        blob_path (str): Path within the bucket where the data will be saved.
        data (str): String content to upload (in JSON format).

    Returns:
        None
    """

    blob=bucket.blob(blob_path)
    blob.upload_from_string(data, content_type="application/json")
    print(f"Uploaded data to {blob_path}")


if __name__=="__main__":
    with open("../../topics.json","r") as f:
        topics_json=json.load(f)
    domains=list(topics_json.keys())
    for domain in domains:
        get_transcripts_for_videos(domain)
        