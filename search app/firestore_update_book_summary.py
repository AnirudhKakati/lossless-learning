# summarize_topics.py

import re
import json
from collections import defaultdict

from google.cloud import storage
import vertexai

from langchain.prompts import PromptTemplate
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_google_community import VertexAISearchRetriever
from langchain_google_vertexai import VertexAI


def read_json_from_gcs(bucket_name: str, file_path: str) -> dict:
    """Reads a JSON file from Google Cloud Storage."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_path)
    return json.loads(blob.download_as_text())


def setup_vertexai(project_id: str, location: str):
    """Initializes Vertex AI SDK."""
    vertexai.init(project=project_id, location=location)


def create_langchain_pipeline(project_id: str, data_store_location: str, data_store_id: str, model: str):
    """Creates LangChain LLM, retriever, and chain pipeline."""
    llm = VertexAI(model_name=model)

    retriever = VertexAISearchRetriever(
        project_id=project_id,
        location_id=data_store_location,
        data_store_id=data_store_id,
        get_extractive_answers=True,
        max_documents=4,
        max_extractive_segment_count=5,
        max_extractive_answer_count=5,
        beta=True
    )

    system_prompt = (
        "Guiding Principle - Follow the instructions strictly: "
        "You are a helpful AI that provides detailed and descriptive answers using LaTeX formatting. "
        "Use proper LaTeX structure for equations with `$$...$$` and format the text clearly. "
        "Use at least 200 words in your response. "
        "Start immediately with the explanation — do not include any introductory or transition sentences like "
        "'Here is a summary', 'Based on the context', or 'As mentioned above'. "
        "Avoid all phrases that refer to the context or the user request. "
        "Just begin with headings like 'Definition', 'Concepts', 'Examples', etc. "
        "Do not include any preamble or meta-comments. "
        "Answer only using the context provided. "
        "If the answer cannot be inferred, respond with 'I don't know.' "
        "\n\nContext: {context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever, question_answer_chain)


def summarize_all_topics(data: dict, chain) -> tuple[dict, dict, list]:
    """Generates summaries and document contexts for all topics."""
    docs = defaultdict(list)
    summary_doc = defaultdict(list)
    null_topics = []

    for domain in data.keys():
        print(f"Started domain: {domain}")
        for sub_domain in data[domain]:
            for topic in data[domain][sub_domain]:
                search_query = f"Explain the {topic}"
                res = chain.invoke({"input": search_query})
                answer = res['answer']

                summary = {
                    'domain': domain,
                    'sub_domain': sub_domain,
                    'topic': topic,
                    'summary': answer
                }
                summary_doc[domain].append(summary)

                if not res['context']:
                    null_topics.append(topic)
                else:
                    for i in range(min(5, len(res['context']))):
                        raw_source = res['context'][i].metadata.get('source', '')
                        page_content = res['context'][i].page_content
                        match = re.search(r'^(.*\.pdf)(\d+)$', raw_source)

                        page_number = int(match.group(2)) if match else ''
                        source = match.group(1) if match else ''

                        doc = {
                            'domain': domain,
                            'sub_domain': sub_domain,
                            'topic': topic,
                            'resource_type': 'book',
                            'gcs_uri': source,
                            'page_no': page_number,
                            'page_oevrview': page_content
                        }

                        docs['domain'].append(doc)
        print(f"Domain done: {domain}")

    return summary_doc, docs, null_topics


def main():
    # Configs
    bucket_name = "lossless-learning"
    file_path = "topics.json"
    project_id = "ardent-sun-453501-d5"
    location = "us-central1"
    data_store_id = "book_store"
    data_store_location = "global"
    model = "gemini-2.0-flash"

    # Pipeline
    setup_vertexai(project_id, location)
    data = read_json_from_gcs(bucket_name, file_path)
    chain = create_langchain_pipeline(project_id, data_store_location, data_store_id, model)
    summary_doc, docs, null_topics = summarize_all_topics(data, chain)

    # Optional: save or return results
    print("Summary generation complete.")


if __name__ == "__main__":
    main()
