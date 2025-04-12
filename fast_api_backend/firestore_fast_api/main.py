from fastapi import FastAPI, HTTPException, Request, Depends
from firestore_utils import get_resources, get_resource_by_id
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import traceback

app=FastAPI() #initialize the fastAPI app

# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# only allow these query parameters
ALLOWED_QUERY_PARAMS={"topic","domain","sub_domain","resource_type"}

# dependency to reject unknown query params
def validate_query_params(request: Request):
    """
    Validates that all query parameters in the request are explicitly allowed.

    This function is used as a FastAPI dependency to enforce strict control over 
    accepted query parameters. It compares the keys in the incoming request's 
    query parameters against a predefined set of allowed keys. If any unexpected 
    parameters are found, it raises a 400 Bad Request error.

    Args:
        request (Request): The incoming FastAPI request object.

    Raises:
        HTTPException: If one or more invalid query parameters are present.
    """

    invalid_keys=set(request.query_params.keys())-ALLOWED_QUERY_PARAMS
    if invalid_keys:
        raise HTTPException(status_code=400,detail=f"Invalid query parameter(s): {', '.join(invalid_keys)}")

# NOTE: FastAPI supports both sync and async route handlers.
# we're using `async def` here to allow for future integration with async I/O operations
# such as calling external APIs, querying async databases, or running multiple network tasks in parallel using asyncio.
# this also aligns with FastAPI’s ASGI-based architecture for non-blocking performance.

@app.get("/resources", dependencies=[Depends(validate_query_params)]) #add the dependency of query parameters
async def fetch_resources(topic:Optional[str]=None, domain:Optional[str]=None,resource_type: Optional[str]=None,sub_domain: Optional[str]=None):
    """
    Fetch resources from Firestore based on optional filters: topic, domain, sub_domain, and resource type.

    Query Parameters:
        topic (str, optional): Specific topic to filter results by.
        domain (str, optional): Domain of the topic (e.g., "Deep Learning", "Foundational Mathematics").
        resource_type (str, optional): Type of resource (e.g., "articles", "videos", "github_repos").
        sub_domain (str, optional): sub_domain within the domain to filter by.

    Returns:
        list: A list of matching resources from Firestore.

    Raises:
        HTTPException: If any error occurs while fetching resources.
    """

    try:
        return get_resources(topic, domain, sub_domain, resource_type)
    except Exception as e:
        print("Error fetching resources:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error fetching resources from Firestore")

@app.get("/resource/{resource_id}")
async def fetch_resource_by_id(resource_id: str):
    """
    Fetch a specific resource by its unique Firestore document ID.

    Path Parameters:
        resource_id (str): The document ID of the resource to retrieve.

    Returns:
        dict: The resource document from Firestore.

    Raises:
        HTTPException: 404 if resource not found, 500 for other errors.
    """

    try:
        return get_resource_by_id(resource_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print("Error fetching resource by ID:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error fetching resource from Firestore")