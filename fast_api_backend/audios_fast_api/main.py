from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.cloud import storage
from google.api_core.exceptions import NotFound, GoogleAPIError
import io

app = FastAPI() #initialize fast api connection

# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.get("/get_audio")
def get_audio_url(resource_id: str):
    """
    Generate a signed URL to stream/download the MP3 audio summary for a given resource.

    Args:
        resource_id (str): Unique identifier for the resource whose audio file is requested.

    Returns:
        dict: A dictionary containing the signed URL to access the MP3 file.

    Raises:
        HTTPException: 404 if file not found, 500 for other errors.
    """

    try:
        client = storage.Client()
        bucket = client.bucket("lossless-learning")
        blob_path = f"transcript_summary_to_audio/summary_{resource_id}.mp3" #get the path based on resource_id
        blob = bucket.blob(blob_path)

        #check if the file exists
        if not blob.exists():
            raise NotFound(f"Blob {blob_path} not found")

        #download the file content into memory
        content = blob.download_as_bytes()
        
        #return the content as a streaming response
        return StreamingResponse(io.BytesIO(content),media_type="audio/mpeg",
                                 headers={"Content-Disposition": f"attachment; filename=summary_{resource_id}.mp3"})

    except NotFound:
        # case where the requested audio file doesn't exist
        raise HTTPException(status_code=404, detail=f"Audio file not found for resource_id: {resource_id}")
    except GoogleAPIError as e:
        #for Google API-specific errors (authentication, quota, etc.)
        raise HTTPException(status_code=500, detail=f"Storage API error: {e}")
    except Exception as e:
        #any other unexpected errors
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")