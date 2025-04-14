from fastapi import FastAPI
import pickle

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
