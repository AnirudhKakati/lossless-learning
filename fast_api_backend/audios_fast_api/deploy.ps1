#get the current project from gcloud config
$projectId = gcloud config get-value project
$region = "us-central1"
$serviceName = "lossless-learning-audios-fastapi"
$imageTag = "lossless-learning-audios-fastapi"

#build and push the container image
gcloud builds submit --tag gcr.io/$projectId/$imageTag

#deploy to Cloud Run with --service-account
$serviceAccount = "audios-fast-api-sa@$projectId.iam.gserviceaccount.com"

gcloud run deploy $serviceName `
  --image gcr.io/$projectId/$imageTag `
  --platform managed `
  --region $region `
  --allow-unauthenticated `
  --service-account $serviceAccount

#display the URL of the deployed service
gcloud run services describe $serviceName --region $region --format='value(status.url)'