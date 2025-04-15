#get the current project from gcloud config
$projectId = gcloud config get-value project
$region = "us-central1"
$serviceName = "lossless-learning-search-fastapi"
$imageTag = "lossless-learning-search-fastapi"

#build & push the Docker image
gcloud builds submit --tag "gcr.io/$projectId/$imageTag"

#deploy with --service-account
$runServiceAccount = "search-fastapi-sa@$projectId.iam.gserviceaccount.com"

gcloud run deploy $serviceName `
  --image "gcr.io/$projectId/$imageTag" `
  --platform managed `
  --region $region `
  --memory 1Gi `
  --cpu 1 `
  --allow-unauthenticated `
  --service-account $runServiceAccount `
  --set-env-vars PROJECT_ID="$projectId" `
  --set-env-vars LOCATION="us-central1" `
  --set-env-vars DATA_STORE_ID="book_store" `
  --set-env-vars DATA_STORE_LOCATION="global" `
  --set-env-vars MODEL="gemini-2.0-flash"

#display the URL of the deployed service
gcloud run services describe $serviceName --region $region --format='value(status.url)'

