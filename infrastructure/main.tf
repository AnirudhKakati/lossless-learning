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

#we create a secret for the youtube api key which is currently in .tfvars file
resource "google_secret_manager_secret" "youtube_api_key" {
  secret_id = "youtube-api-key"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "youtube_api_key_version" {
  secret      = google_secret_manager_secret.youtube_api_key.id
  secret_data = var.youtube_api_key
}

#we create a secret for the github access token which is currently in .tfvars file
resource "google_secret_manager_secret" "github_access_token" {
  secret_id = "github-access-token"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "github_access_token_version" {
  secret      = google_secret_manager_secret.github_access_token.id
  secret_data = var.github_access_token
}

#we create a secret for the custom search api key which is currently in .tfvars file
resource "google_secret_manager_secret" "custom_search_api_key" {
  secret_id = "custom-search-api-key"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "custom_search_api_key_version" {
  secret      = google_secret_manager_secret.custom_search_api_key.id
  secret_data = var.custom_search_api_key
}

#we create a secret for the custom search engine id which is currently in .tfvars file
resource "google_secret_manager_secret" "custom_search_engine_id" {
  secret_id = "custom-search-engine-id"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "custom_search_engine_id_version" {
  secret      = google_secret_manager_secret.custom_search_engine_id.id
  secret_data = var.custom_search_engine_id
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
#this will be used in the trigger for the cloud functions


## THIS SECTION IS FOR YOUTUBE DATA FETCHING CLOUD FUNCTION
# create a service account for the YouTube data fetcher Cloud Function
resource "google_service_account" "youtube_data_fetcher_sa" {
  account_id   = "youtube-data-fetcher-sa"
  display_name = "Service Account for YouTube Data Fetcher"
  project      = var.project_id
}

# grant bucket access to the service account
resource "google_storage_bucket_iam_member" "bucket_access_yt" {
  bucket = google_storage_bucket.main_project_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.youtube_data_fetcher_sa.email}"
}

# grant Secret Manager access to the service account
resource "google_secret_manager_secret_iam_member" "secret_access_yt" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.youtube_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.youtube_data_fetcher_sa.email}"
}

# upload the function code to the bucket with a content-hashed name to trigger updates only when code changes
resource "google_storage_bucket_object" "function_archive_yt" {
  name   = "cloud_functions/fetching_youtube_videos_function_${filemd5("${path.module}/../scripts/fetching_youtube_videos/fetching_youtube_videos_function.zip")}.zip"
  bucket = google_storage_bucket.main_project_bucket.name
  source = "${path.module}/../scripts/fetching_youtube_videos/fetching_youtube_videos_function.zip"
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
        object = google_storage_bucket_object.function_archive_yt.name
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
resource "google_cloud_run_service_iam_member" "invoker_yt" {
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
  schedule    = "30 0 ${count.index + 1} * *"  # run on different days of the month
  
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
## END OF SECTION FOR YOUTUBE DATA FETCHING CLOUD FUNCTION

## THIS SECTION IS FOR GITHUB REPO FETCHING CLOUD FUNCTION
# create a service account for the Github repo fetcher Cloud Function
resource "google_service_account" "github_repo_fetcher_sa" {
  account_id   = "github-repo-fetcher-sa"
  display_name = "Service Account for Github Repo Fetcher"
  project      = var.project_id
}

# grant bucket access to the service account
resource "google_storage_bucket_iam_member" "bucket_access_gh" {
  bucket = google_storage_bucket.main_project_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.github_repo_fetcher_sa.email}"
}

# grant Secret Manager access to the service account
resource "google_secret_manager_secret_iam_member" "secret_access_gh" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.github_access_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_repo_fetcher_sa.email}"
}

# upload the function code to the bucket with a content-hashed name to trigger updates only when code changes
resource "google_storage_bucket_object" "function_archive_gh" {
  name   = "cloud_functions/fetching_github_repos_function_${filemd5("${path.module}/../scripts/fetching_github_repos/fetching_github_repos_function.zip")}.zip"
  bucket = google_storage_bucket.main_project_bucket.name
  source = "${path.module}/../scripts/fetching_github_repos/fetching_github_repos_function.zip" 
}

# cloud Functions v2 deployment for the youtube data fetching function to fetch for each domain
resource "google_cloudfunctions2_function" "github_repo_fetcher" {
  name        = "github-repo-fetcher"
  location    = var.region
  description = "Fetches Github repos for specified domains"
  
  build_config {
    runtime     = "python311"
    entry_point = "github_repo_fetcher" 
    source {
      storage_source {
        bucket = google_storage_bucket.main_project_bucket.name
        object = google_storage_bucket_object.function_archive_gh.name
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
    service_account_email = google_service_account.github_repo_fetcher_sa.email
  }
}

# allow invocation of the function by all users
resource "google_cloud_run_service_iam_member" "invoker_gh" {
  location = google_cloudfunctions2_function.github_repo_fetcher.location
  service  = google_cloudfunctions2_function.github_repo_fetcher.name
  role     = "roles/run.invoker"
  member   = "allUsers" 
}

# create a Cloud Scheduler job for each domain to trigger the Cloud Function
resource "google_cloud_scheduler_job" "github_repo_fetch_jobs" {
  count       = length(local.domains)
  name        = "fetch-github-repo-${lower(replace(local.domains[count.index], " ", "-"))}"
  description = "Triggers Github repo fetching for ${local.domains[count.index]}"
  schedule    = "0 0 ${count.index + 1} * *"  # run on different days of the month
  
  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.github_repo_fetcher.service_config[0].uri
    
    oidc_token {
      service_account_email = google_service_account.github_repo_fetcher_sa.email
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
## END OF SECTION FOR GITHUB REPO FETCHING CLOUD FUNCTION

## THIS SECTION IS FOR GOOGLE SEARCH ARTICLES FETCHING CLOUD FUNCTION
# create a service account for the articles fetcher Cloud Function
resource "google_service_account" "articles_fetcher_sa" {
  account_id   = "articles-fetcher-sa"
  display_name = "Service Account for Articles Fetcher"
  project      = var.project_id
}

# grant bucket access to the service account
resource "google_storage_bucket_iam_member" "bucket_access_at" {
  bucket = google_storage_bucket.main_project_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.articles_fetcher_sa.email}"
}

# grant Secret Manager access to the service account
locals {
  secret_resources = {
    "custom_search_engine_id" = google_secret_manager_secret.custom_search_engine_id.secret_id
    "custom_search_api_key"   = google_secret_manager_secret.custom_search_api_key.secret_id
  }
}

resource "google_secret_manager_secret_iam_member" "secret_access_at" {
  for_each = local.secret_resources #IAM binding using for_each
  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.articles_fetcher_sa.email}"
}

# upload the function code to the bucket with a content-hashed name to trigger updates only when code changes
resource "google_storage_bucket_object" "function_archive_at" {
  name   = "cloud_functions/fetching_articles_function_${filemd5("${path.module}/../scripts/fetching_articles/fetching_articles_function.zip")}.zip"
  bucket = google_storage_bucket.main_project_bucket.name
  source = "${path.module}/../scripts/fetching_articles/fetching_articles_function.zip"
}

# cloud Functions v2 deployment for the articles fetching function to fetch for each domain
resource "google_cloudfunctions2_function" "articles_fetcher" {
  name        = "articles-fetcher"
  location    = var.region
  description = "Fetches articles through google search for specified domains"
  
  build_config {
    runtime     = "python311"
    entry_point = "articles_fetcher" 
    source {
      storage_source {
        bucket = google_storage_bucket.main_project_bucket.name
        object = google_storage_bucket_object.function_archive_at.name
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
    service_account_email = google_service_account.articles_fetcher_sa.email
  }
}

# allow invocation of the function by all users
resource "google_cloud_run_service_iam_member" "invoker_at" {
  location = google_cloudfunctions2_function.articles_fetcher.location
  service  = google_cloudfunctions2_function.articles_fetcher.name
  role     = "roles/run.invoker"
  member   = "allUsers" 
}

# create a Cloud Scheduler job for each domain to trigger the Cloud Function
resource "google_cloud_scheduler_job" "articles_fetch_jobs" {
  count       = length(local.domains)
  name        = "fetch-articles-${lower(replace(local.domains[count.index], " ", "-"))}"
  description = "Triggers articles fetching for ${local.domains[count.index]}"
  schedule    = "15 0 ${count.index + 1} * *"  # run on different days of the month
  
  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.articles_fetcher.service_config[0].uri
    
    oidc_token {
      service_account_email = google_service_account.articles_fetcher_sa.email
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
## END OF SECTION FOR ARTICLES FETCHING CLOUD FUNCTION

#firestore database to store all our fetched data
resource "google_project_service" "firestore" {
  project = var.project_id
  service = "firestore.googleapis.com"
}

resource "google_firestore_database" "firestore_db" {
  project     = var.project_id
  name        = "(default)" # firestore expects this exact name
  location_id = var.region  
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.firestore]
}