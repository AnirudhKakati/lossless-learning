import json
import functions_framework
from google.cloud import storage
import vertexai
from vertexai.generative_models import GenerativeModel

#storage client setup
storage_client=storage.Client()

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

def build_prompt(topic):
    """
    Build a prompt for the AI model to generate a topic summary.
    
    Args:
        topic (str): The topic to generate a summary for.
        
    Returns:
        str: The formatted prompt.
    """
    return (
        f"You are an expert educator writing concise topic explanations for a learning platform. "
        f"For the topic: \"{topic}\", write a clean and precise explanation (around 150–250 words). "
        f"Format all math expressions using LaTeX — inline expressions using \\( ... \\) and block expressions using \\[ ... \\]. "
        f"Avoid filler, analogies, or introductory phrases. "
        f"Ensure the output is a plain-text string suitable for rendering on a frontend that supports LaTeX via MathJax. "
        f"Do not include markdown headers, links, or extra formatting. Return only the formatted summary."
    )

def generate_topic_summaries(domain, bucket_name, topics_file_path, output_folder, project_id, location="us-central1", model_name="gemini-2.0-flash"):
    """
    Generate summaries for all topics under a specific domain using Vertex AI and save the data as a JSON file to GCS.

    Args:
        domain (str): Top-level domain (e.g., "Machine Learning") to generate summaries for.
        bucket_name (str): Name of the GCS bucket containing the topics file and where output will be saved.
        topics_file_path (str): Path to the JSON file listing topics, organized by domain and subdomain.
        output_folder (str): Folder in GCS where the result JSON file will be saved.
        project_id (str): Google Cloud project ID.
        location (str, optional): Region for Vertex AI. Defaults to "us-central1".
        model_name (str, optional): Generative AI model to use. Defaults to "gemini-2.0-flash".

    Returns:
        str: Success message with domain and output file path.
    """
    #initialize Vertex AI
    vertexai.init(project=project_id, location=location)
    model=GenerativeModel(model_name)
    
    #get topics data from GCS
    topics_json=get_topics_json(bucket_name, topics_file_path)
    
    output=[]
    
    #only process the requested domain
    if domain in topics_json:
        for subdomain, topics in topics_json[domain].items():
            print(f"Generating summaries for {subdomain}")
            
            for topic in topics.keys():
                print(f"Generating summary for: {topic}")
                prompt=build_prompt(topic)
                
                try:
                    response=model.generate_content(prompt)
                    summary=response.text.strip()
                except Exception as e:
                    print(f"Error generating summary for {topic}: {e}")
                    summary=""
                
                output.append({
                    "domain": domain,
                    "subdomain": subdomain,
                    "topic": topic,
                    "summary": summary
                })
                
            print(f"Generated summaries for {subdomain}")
    else:
        return f"Error: Domain '{domain}' not found in topics file", 400
    
    print(f"Successfully generated summaries for domain: {domain}")
    
    #convert to JSON and save to bucket
    file_name=f"{output_folder}/{domain.lower().replace(' ', '_')}_topic_summaries.json"
    json_data=json.dumps(output, indent=4)
    
    save_data_to_bucket(bucket_name, file_name, json_data)
    
    return f"Processed domain: {domain}, saved to {file_name}"

@functions_framework.http
def summary_generator(request):
    """
    HTTP-triggered Cloud Function to generate topic summaries for a given domain and store them in GCS.

    Expects a JSON payload or query parameters with at least 'domain' and 'project_id'.
    Optional parameters include 'bucket_name', 'topics_file_path', 'output_folder', 'location', and 'model_name'.

    Args:
        request (flask.Request): The HTTP request object containing JSON or query parameters.

    Returns:
        tuple: A response string and HTTP status code.
    """
    request_json=request.get_json(silent=True)
    request_args=request.args
    
    #set default values
    default_bucket="lossless-learning"
    default_topics_path="topics.json"
    default_output_folder="fetched_topic_summaries"
    default_location="us-central1"
    default_model_name="gemini-2.0-flash"
    
    #extract parameters with defaults
    if request_json:
        domain=request_json.get('domain')
        bucket_name=request_json.get('bucket_name', default_bucket)
        topics_file_path=request_json.get('topics_file_path', default_topics_path)
        output_folder=request_json.get('output_folder', default_output_folder)
        project_id=request_json.get('project_id')
        location=request_json.get('location', default_location)
        model_name=request_json.get('model_name', default_model_name)
    elif request_args:
        domain=request_args.get('domain')
        bucket_name=request_args.get('bucket_name', default_bucket)
        topics_file_path=request_args.get('topics_file_path', default_topics_path)
        output_folder=request_args.get('output_folder', default_output_folder)
        project_id=request_args.get('project_id')
        location=request_args.get('location', default_location)
        model_name=request_args.get('model_name', default_model_name)
    else:
        return "Error: Please provide request parameters", 400
    
    #validate required parameters
    if not domain:
        return "Error: Please provide a 'domain' parameter", 400
    
    if not project_id:
        return "Error: Please provide a 'project_id' parameter", 400
    
    try:
        result=generate_topic_summaries(domain=domain,bucket_name=bucket_name,topics_file_path=topics_file_path,output_folder=output_folder,
                                        project_id=project_id,location=location,model_name=model_name)
        return result, 200
    except Exception as e:
        return f"Error processing request: {str(e)}", 500