#get the current project from gcloud config
$projectId = gcloud config get-value project
$region = "us-central1"
$serviceName = "lossless-learning-react-frontend"
$imageTag = "lossless-learning-react-frontend"

#build and push the container image
Write-Host "Building and pushing container image..."
gcloud builds submit --tag gcr.io/$projectId/$imageTag

#deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $serviceName --image gcr.io/$projectId/$imageTag --platform managed --region $region --allow-unauthenticated

#display the URL of the deployed service
Write-Host "Deployment complete. Service URL:"
gcloud run services describe $serviceName --region $region --format='value(status.url)'