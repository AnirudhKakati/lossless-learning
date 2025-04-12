from google.cloud import firestore

db=firestore.Client() #initialize Firestore client

def get_resources(topic=None, domain=None, sub_domain=None, resource_type=None):
    """
    Query the Firestore 'resources' collection with optional filters for topic, domain, sub_domain, and resource type.

    Args:
        topic (str, optional): Filter by specific topic (e.g., "Gradient Descent Optimization Algorithm").
        domain (str, optional): Filter by domain (e.g., "Classical Machine Learning").
        sub_domain (str, optional): Filter by sub_domain within the domain.
        resource_type (str, optional): Filter by resource type ("articles", "videos", "github_repos").

    Returns:
        list: A list of resource documents (as dictionaries) matching the filters.
    """

    query=db.collection("resources") # start the query on the 'resources' collection
    # apply filters based on which parameters were passed
    if topic:
        query=query.where("topic", "==", topic)
    if domain:
        query=query.where("domain", "==", domain)
    if sub_domain:
        query=query.where("sub_domain", "==", sub_domain)
    if resource_type:
        query=query.where("resource_type", "==", resource_type)

    docs=query.stream() #execute the query and convert each result to a dictionary
    return [doc.to_dict() for doc in docs]

def get_resource_by_id(resource_id):
    """
    Fetch a single resource document from Firestore by its document ID.

    Args:
        resource_id (str): The Firestore document ID of the resource.

    Returns:
        dict: The resource document as a dictionary.

    Raises:
        ValueError: If the document does not exist.
    """

    doc_ref=db.collection("resources").document(resource_id)
    doc=doc_ref.get()
    if doc.exists: #check if the document exists and return it, otherwise raise an error
        return doc.to_dict()
    else:
        raise ValueError("Resource not found")