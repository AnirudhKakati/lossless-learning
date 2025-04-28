# lossless-learning

A scalable, serverless platform curating the highest-quality Machine Learning educational resources from across the internet. Built with a full suite of GCP services, serverless architecture, and AI-driven content enrichment, designed for production-grade scale.

## Why use Lossless-Learning?

* Curated resources for over 150 topics across ML mathematics, programming, and theory
* Unified discovery of Books, YouTube videos, GitHub repositories, and articles
* Finetuned topic summaries using custom Vertex AI RAG agent (Gemini 2.0 Flash)
* AI-generated audio summaries available for every youtube video
* Full user personalization system with login, favorites, and top-liked resources

Visit the live app:
https://lossless-learning-react-frontend-kbhge3in6a-uc.a.run.app/

## Architecture Overview

![Architecture Diagram](lossless_learning_architecture_diagram.png)

## Full System Workflow

### 1. Data Curation and Enrichment

* **Topics JSON:** Hierarchical ML topics structure across 5 domains
* **Data Fetch Pipelines:**
  * Articles via Google Search API
  * Videos via YouTube Data API
  * GitHub repositories via GitHub Search API
* **YouTube Transcripts:** Extract full transcripts per video
* **Topic Summarization:**
  * Custom Vertex AI Gemini 2.0 Flash RAG agent generates concise, LaTeX-formatted summaries
* **Audio Summaries:**
  * Text-to-speech generation of youtube video summaries to MP3 stored in GCS

### 2. Storage and Processing

* **Firestore:**
  * Resource metadata stored with deduplication (hashing URLs)
* **CloudSQL (PostgreSQL):**
  * Secure user management, session handling, and resource likes tracking

### 3. Backend Microservices (FastAPI)

Each FastAPI app is a separately deployed Cloud Run service, Dockerized individually:

| Folder | Purpose |
|:-------|:--------|
| `firestore_fast_api` | Filter and fetch resources (topic/domain/subdomain/resource type) from Firestore |
| `audios_fast_api` | Stream/download AI-generated MP3 audio summaries from GCS |
| `cloudsql_fast_api` | User register/login and resource like/unlike system |
| `autocomplete_fast_api` | Topic search autocomplete using a Trie data structure |
| `search_fast_api` | Full-text QA retrieval via Vertex AI Search with Gemini 2.0 Flash LLM |

### 4. Frontend

* Built in **React.js**, deployed to **Cloud Run**
* Features:
  * Topic browsing and resource discovery
  * Autocomplete search suggestions
  * Full-text RAG-powered search across resources
  * Favorite and revisit resources anytime
  * Play AI-generated audio summaries in-browser

## GCP Services Used

* **Cloud Storage:** Resource files, transcripts, and audio summaries
* **Cloud Functions:** Serverless data fetching and processing (6 functions)
* **Firestore:** Scalable NoSQL database for resource metadata
* **CloudSQL (PostgreSQL):** User sessions and likes tracking
* **Cloud Run:** Hosting containerized backend APIs and frontend app
* **Vertex AI:** Custom RAG agent for summarization and search QA
* **Secret Manager:** Secure storage of API keys and credentials
* **Terraform:** Infrastructure-as-code for full GCP stack deployment
* **Cloud Build + Artifact Registry:** CI/CD pipelines for building and storing images

## Cloud Functions Breakdown

| Function | Role |
|:---------|:-----|
| `fetching_articles` | Fetch articles from Google Search per topic |
| `fetching_youtube_videos` | Fetch top YouTube videos per topic |
| `fetching_github_repos` | Fetch GitHub repositories per topic |
| `fetching_transcripts` | Fetch English transcripts for YouTube videos |
| `generating_topic_summaries` | Generate concise topic summaries with Vertex AI |
| `processing_files_to_firestore` | Deduplicate and ingest resources into Firestore |

## Deployment

* **Infrastructure Provisioning:** Fully automated using Terraform
* **Containerization:** All APIs and frontend containerized via Docker
* **Deployment Pipelines:** Built and pushed using Cloud Build and deployed to Cloud Run
* **Credential Management:** Secrets stored and accessed securely through Secret Manager

---

Lossless-Learning is designed as a production-grade, serverless ML education platform, seamlessly blending data engineering, AI enrichment, and full-stack development into a single scalable system.

Built for real-world scale. Built for learners who demand the best.
