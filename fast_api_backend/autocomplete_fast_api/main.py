from fastapi import FastAPI
import pickle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

#try loading the pre-trained Trie object from a pickle file.
#if the file does not exist (first run), initialize an empty Trie.
try:
    with open('trie.pkl', 'rb') as f:
        from trie import Trie
        trie: Trie = pickle.load(f)
except FileNotFoundError:
    from trie import Trie
    trie = Trie()

@app.get("/search/autocomplete")
def search_most_frequent(phrase: str):
    """
    Endpoint to return autocomplete suggestions for a given input phrase using a prefix match tree.

    Args:
        phrase (str): The input string (partial phrase) to base autocomplete suggestions on.

    Returns:
        dict: A dictionary containing a list of suggestion strings under the key "suggestions".
    """
    
    suggestions = trie.search_most_frequent(phrase.lower())
    return {"suggestions": suggestions}
