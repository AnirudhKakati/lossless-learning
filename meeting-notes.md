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

Meeting Date: 3/12/2025

A GCP project was created for cloud commuting. 

For current data sources, we plan on using book pdfs, fetching YouTube video links, educational resources from colleges such as MIT. It will initially be stored in a data lake and then processed to a database format. 

We also want to include information from reference books. This comes with the issue of needed to only find specific information from the whole book related to a certain ML topic. Possible solutions discussed included using LLMs to find relavent data. 

To track user habits, we plan on storing statistics of how many clicks a page has or how much time a user has spent on a page. We can then use this data for trending articles and to create visualizations. 

For the front end, a Figma prototype was created for the home/dashboard page. We will continue with transfering the prototype to code. For the additional pages, more Figma prototypes will be created and tested. 
