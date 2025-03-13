Meeting Date: 2/29/2025

Notes:

    Went over general breakdown of roles and responsibilities for the project

    Front-End: 
        Develops user interface for reading summaries, visualizing trending items, and browsing materials
        Works closely with backend to integrate APIs
        Team Member: Zack Carlstrom
    Back-End & Data Pipeline:
        Sets up Kafka (or Kinesis) for streaming user events
        Implements Spark/Flink jobs for ETL, real-time analytics, and indexing 
        Works work frontend and ML/LLM team on data format and endpoints
        Team Member: Anirudh Kakati
    ML/LLM Specialist:
        Integrates a open-source LLM for generating summaries of the resources
        Optimizes LLM usage
        Tunes or refines text processing scripts to ensure clean, concise summaries
        Team Members: Ankush Raut & Tapas Das
    Infrastructure & DevOps:
        Terraform scripts provision the required cloud resource on a free tier
        An Agile board for tracking development tasks and sprints
        Team Members: Ankush Raut & Tapas Das

    By the next meeting, we plan on clearly defining the tools and scope of the project. We will create a document to show the professor to get feedback on the project idea. 


Meeting Date: 3/5/2025

Notes:

    We initially wanted our project to be a broad educational website where users could find resources and create summaries using AI. After deliberation, we decided to narrow the scope of our project to mainly focus on machine learning topics. 

    To find data, we will compile a bunch of publicly available educational sources. 

    We have decided to move forward with using GCP as the main cloud platform for the project. 

    For the initial design, we will create a skeleton of the web application with minimal features. This will include features such as detailed views of educational material and the ability to summarize. Once we have this initial design down, we will build on it and create more features.

    For our agile management tool, we will use Jira. 
