#main project bucket
resource "google_storage_bucket" "main_project_bucket" {
  name          = var.project_bucket_name
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = true
  
  versioning {
    enabled = true
  }
}

#we add the topics.json file into a GCS bucket
resource "google_storage_bucket_object" "topics_json_file" {
  name   = "topics.json" 
  source = "${path.module}/../topics.json"
  bucket = google_storage_bucket.main_project_bucket.name
}

resource "google_secret_manager_secret" "youtube_api_key" {
  secret_id = "youtube-api-key"
  
  replication {
    auto {}
  }
}

#we create a secret for the youtube api key which is currently in .tfvars file
resource "google_secret_manager_secret_version" "youtube_api_key_version" {
  secret      = google_secret_manager_secret.youtube_api_key.id
  secret_data = var.youtube_api_key
}

# we will take the topics json file and extract the domains from it
data "local_file" "topics_json" {
  filename = "${path.module}/../topics.json"
}

locals {
  topics_data = jsondecode(data.local_file.topics_json.content)
  
  # extract the top-level keys (domains)
  domains = keys(local.topics_data)
}
#this will be used in the trigger for the youtube data fetching cloud function

# create a service account for the YouTube data fetcher Cloud Function
resource "google_service_account" "youtube_data_fetcher_sa" {
  account_id   = "youtube-data-fetcher-sa"
  display_name = "Service Account for YouTube Data Fetcher"
  project      = var.project_id
}

# grant bucket access to the service account
resource "google_storage_bucket_iam_member" "bucket_access" {
  bucket = google_storage_bucket.main_project_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.youtube_data_fetcher_sa.email}"
}

# grant Secret Manager access to the service account
resource "google_secret_manager_secret_iam_member" "secret_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.youtube_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.youtube_data_fetcher_sa.email}"
}

# upload the function code to the bucket with timestampped name
resource "google_storage_bucket_object" "function_archive" {
  name   = "cloud_functions/fetching_youtube_videos_function_${formatdate("YYYYMMDDhhmmss", timestamp())}.zip"
  bucket = google_storage_bucket.main_project_bucket.name
  source = "${path.module}/../scripts/fetching_youtube_videos/fetching_youtube_videos_function.zip"  # Path to your zipped function
}

# cloud Functions v2 deployment for the youtube data fetching function to fetch for each domain
resource "google_cloudfunctions2_function" "youtube_data_fetcher" {
  name        = "youtube-data-fetcher"
  location    = var.region
  description = "Fetches YouTube data for specified domains"
  
  build_config {
    runtime     = "python311"
    entry_point = "youtube_data_fetcher" 
    source {
      storage_source {
        bucket = google_storage_bucket.main_project_bucket.name
        object = google_storage_bucket_object.function_archive.name
      }
    }
  }

  service_config {
    max_instance_count = 10
    min_instance_count = 0
    available_memory   = "2048Mi"
    timeout_seconds    = 540
    environment_variables = {
      DEFAULT_BUCKET_NAME = var.project_bucket_name
    }
    service_account_email = google_service_account.youtube_data_fetcher_sa.email
  }
}

# allow invocation of the function by all users
resource "google_cloud_run_service_iam_member" "invoker" {
  location = google_cloudfunctions2_function.youtube_data_fetcher.location
  service  = google_cloudfunctions2_function.youtube_data_fetcher.name
  role     = "roles/run.invoker"
  member   = "allUsers" 
}

# create a Cloud Scheduler job for each domain to trigger the Cloud Function
resource "google_cloud_scheduler_job" "youtube_data_fetch_jobs" {
  count       = length(local.domains)
  name        = "fetch-youtube-data-${lower(replace(local.domains[count.index], " ", "-"))}"
  description = "Triggers YouTube data fetching for ${local.domains[count.index]}"
  schedule    = "0 0 ${count.index + 1} * *"  # run on different days of the month
  
  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.youtube_data_fetcher.service_config[0].uri
    
    oidc_token {
      service_account_email = google_service_account.youtube_data_fetcher_sa.email
    }
    
    body = base64encode(jsonencode({
      domain      = local.domains[count.index],
      bucket_name = var.project_bucket_name,
      project_id  = var.project_id
    }))
    
    headers = {
      "Content-Type" = "application/json"
    }
  }
}
