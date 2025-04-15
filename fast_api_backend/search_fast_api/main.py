from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict, Any
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import VertexAI
from langchain_google_community import VertexAISearchRetriever
import vertexai
import re
from collections import defaultdict

app = FastAPI()

# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

PROJECT_ID = "ardent-sun-453501-d5"
LOCATION = "us-central1"
DATA_STORE_ID = "book_store"
DATA_STORE_LOCATION = "global"
MODEL = "gemini-2.0-flash"

vertexai.init(project=PROJECT_ID, location=LOCATION)

llm = VertexAI(model_name=MODEL)

retriever = VertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=DATA_STORE_LOCATION,
    data_store_id=DATA_STORE_ID,
    get_extractive_answers=True,
    max_documents=4,
    max_extractive_segment_count=5,
    max_extractive_answer_count=5,
    beta=True
)

system_prompt = (
    "Guiding Principle - Follow the instructions strictly: "
    "You are a helpful AI that provides detailed and descriptive answers. "
    "Use at least 200 words in your response. "
    "Answer only using the context provided. "
    "If the answer cannot be inferred, respond with 'I don't know.' "
    "\n\nContext: {context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

question_answer_chain = create_stuff_documents_chain(llm, prompt)
chain = create_retrieval_chain(retriever, question_answer_chain)


class Query(BaseModel):
    query: str


@app.post("/ask")
async def ask_question(q: Query) -> Dict[str, Any]:
    try:
        result = chain.invoke({"input": q.query})

        res = defaultdict(dict)
        res['response'] = defaultdict(dict)
        res['response']['answer'] =  result['answer']
        res['response']['context'] = []


        for i in range(min(5, len(result['context']))):


            d = defaultdict()

            raw_source = result['context'][i].metadata['source']

            if '.pdf' in raw_source:

                pc = result['context'][i].page_content
                match = re.search(r'^(.*\.pdf)(\d+)$',raw_source)

                if match:
                    page_number = int(match.group(2))
                    source = str(match.group(1))
                    ns = 'https://storage.googleapis.com/'+'/'.join(source.split("/")[2:]).replace(' ','%20')

                    d['page_num'] = page_number
                    d['public_link'] = ns
                    d['page_content'] = pc
                    res['response']['context'].append(d)
            else:
                 res['response']['context'].append(result['context'][i].metadata)

        return {"response": res}
    except Exception as e:
        return {"error": str(e)}
