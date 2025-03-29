variable "project_id" {
  description = "Lossless Learning  Project ID"
  default     = "ardent-sun-453501-d5"
}

variable "region" {
  description = "GCP region"
  default     = "us-central1"
}

variable "project_bucket_name" {
  description = "Main bucket for the project"
  default     = "lossless-learning"
}

variable "youtube_api_key" {
  description = "YouTube Data API key (sensitive)"
  type        = string
  sensitive   = true
}

variable "github_access_token" {
  description = "Github Access Token (sensitive)"
  type        = string
  sensitive   = true
}

variable "custom_search_api_key" {
  description = "Custom Search API key (sensitive)"
  type        = string
  sensitive   = true
}

variable "custom_search_engine_id" {
  description = "Custom Search Engine ID (sensitive)"
  type = string
  sensitive = true
}