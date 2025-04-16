import pandas as pd
import numpy as np
from typing import List
import pickle

df = pd.read_csv('sample_questions.csv')

row_multipliers = np.random.randint(1, 6, size=len(df))

df_augmented = pd.concat(
    [pd.DataFrame([df.iloc[i]] * row_multipliers[i]) for i in range(len(df))],
    ignore_index=True
)

class TrieNode:
    def __init__(self):
        self.children = {}
        self.sentences = {}  
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, sentence: str):
        node = self.root
        for c in sentence:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
            node.sentences[sentence] = node.sentences.get(sentence, 0) + 1
        node.is_end = True

    def search_most_frequent(self, phrase: str) -> List[str]:
        node = self.root
        for c in phrase:
            if c not in node.children:
                return []  
            node = node.children[c]
        
        sorted_sentences = sorted(node.sentences.items(), key=lambda x: (-x[1], x[0]))
        
        req = sorted_sentences[:5]
        
        sent = [k[0] for k in req]
        return sent

trie = Trie()

for question in df_augmented['questions']:
    trie.insert(question.lower())

print("Sample suggestions for 'what':", trie.search_most_frequent("what"))

with open('trie.pkl', 'wb') as f:
    pickle.dump(trie, f)

print("Trie saved successfully!")
