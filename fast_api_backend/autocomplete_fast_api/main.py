from fastapi import FastAPI
import pickle

from fastapi.middleware.cors import CORSMiddleware


# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)


app = FastAPI()



try:
    with open('trie.pkl', 'rb') as f:
        from trie import Trie
        trie: Trie = pickle.load(f)
except FileNotFoundError:
    from trie import Trie
    trie = Trie()

@app.get("/search")
def search_most_frequent(phrase: str):

    suggestions = trie.search_most_frequent(phrase.lower())
    return {"suggestions": suggestions}
