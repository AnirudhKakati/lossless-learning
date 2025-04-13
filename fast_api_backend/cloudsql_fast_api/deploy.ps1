#get the current project from gcloud config
$projectId = gcloud config get-value project
$region = "us-central1"
$serviceName = "lossless-learning-cloudsql-fastapi"
$imageTag = "lossless-learning-fastapi-sql"
$instanceName = "lossless-learning-sql-instance"

#build & push the Docker image
gcloud builds submit --tag "gcr.io/$projectId/$imageTag"

#build the Cloud SQL instance connection string
$sqlInstanceConnection = "${projectId}:${region}:${instanceName}"

#deploy with --service-account
$runServiceAccount = "cloudsql-fast-api-sa@$projectId.iam.gserviceaccount.com"

gcloud run deploy $serviceName `
  --image "gcr.io/$projectId/$imageTag" `
  --platform managed `
  --region $region `
  --allow-unauthenticated `
  --service-account $runServiceAccount `
  --update-secrets DB_PASS=cloud-sql-db-password:latest `
  --set-env-vars DB_HOST="/cloudsql/${sqlInstanceConnection}" `
  --set-env-vars DB_USER="admin" `
  --set-env-vars DB_NAME="lossless_learning_db" `
  --set-env-vars INSTANCE_CONNECTION_NAME="${sqlInstanceConnection}" `
  --add-cloudsql-instances $sqlInstanceConnection

#display the URL of the deployed service
gcloud run services describe $serviceName --region $region --format='value(status.url)'