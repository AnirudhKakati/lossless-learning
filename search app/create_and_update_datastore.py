from google.cloud import storage
import fitz 
import io
from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine


# Function to list PDF URIs in GCS bucket
def list_pdfs(bucket_name='lossless-learning', prefix="books"):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    return ['gs://lossless-learning/' + blob.name for blob in bucket.list_blobs(prefix=prefix) if blob.name.endswith(".pdf")]


# Function to read PDF content from GCS
def read_pdf_from_gcs(bucket_name, blob_name):
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_name)
    pdf_bytes = blob.download_as_bytes()

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [page.get_text().lower() for page in doc]
    doc.close()
    return pages


# Create a data store in Vertex AI
def create_data_store_sample(project_id: str, location: str, data_store_id: str) -> str:
    client_options = (
        ClientOptions(api_endpoint=f"{location}-discoveryengine.googleapis.com")
        if location != "global"
        else None
    )

    client = discoveryengine.DataStoreServiceClient(client_options=client_options)

    parent = client.collection_path(
        project=project_id,
        location=location,
        collection="default_collection",
    )

    data_store = discoveryengine.DataStore(
        display_name="datastore books",
        industry_vertical=discoveryengine.IndustryVertical.GENERIC,
        solution_types=[discoveryengine.SolutionType.SOLUTION_TYPE_SEARCH],
        content_config=discoveryengine.DataStore.ContentConfig.CONTENT_REQUIRED,
    )

    request = discoveryengine.CreateDataStoreRequest(
        parent=parent,
        data_store_id=data_store_id,
        data_store=data_store,
    )

    operation = client.create_data_store(request=request)
    print(f"Waiting for operation to complete: {operation.operation.name}")
    response = operation.result()

    metadata = discoveryengine.CreateDataStoreMetadata(operation.metadata)
    print(response)
    print(metadata)

    return operation.operation.name


# Import PDFs into the Vertex AI data store
def import_documents(project_id: str, location: str, data_store_id: str, gcs_uris: list):
    client_options = (
        ClientOptions(api_endpoint=f"{location}-discoveryengine.googleapis.com")
        if location != "global"
        else None
    )

    client = discoveryengine.DocumentServiceClient(client_options=client_options)

    parent = client.branch_path(
        project=project_id,
        location=location,
        data_store=data_store_id,
        branch="default_branch",
    )

    request = discoveryengine.ImportDocumentsRequest(
        parent=parent,
        gcs_source=discoveryengine.GcsSource(
            input_uris=gcs_uris,
            data_schema="content",
        ),
        reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
    )

    operation = client.import_documents(request=request)

    print(f"Waiting for operation to complete: {operation.operation.name}")
    response = operation.result()
    metadata = discoveryengine.ImportDocumentsMetadata(operation.metadata)

    print(response)
    print(metadata)


if __name__ == "__main__":
    project_id = "ardent-sun-453501-d5"
    location = "global"
    data_store_id = "book_store"

    # List PDFs
    pdf_list = list_pdfs()

    # Create data store
    create_data_store_sample(project_id, location, data_store_id)

    # Import documents
    import_documents(project_id, location, data_store_id, pdf_list)
