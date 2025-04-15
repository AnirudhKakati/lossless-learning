import os
import pandas as pd
import json
import torch
from tqdm import tqdm

os.environ["TTS_HOME"] = "/scratch/alpine/anra7539"  
os.makedirs(os.environ["TTS_HOME"], exist_ok=True)

from TTS.api import TTS

tts = TTS("tts_models/en/jenny/jenny", 
          gpu=True,
          progress_bar = True)

data = []
file_name = []

for file in os.listdir('/projects/anra7539/projects/big_data/transcript_summaries'):
    if file != '.ipynb_checkpoints':
        output_file = '/projects/anra7539/projects/big_data/transcript_summaries/'+file
        file_name.append(file)
        with open(output_file, 'r') as f:
            data.append(pd.DataFrame([json.loads(line) for line in f]))

for i in range(len(file_name)):
    output_dir = os.path.join("/projects/anra7539/projects/big_data/audio_outputs", file_name[i].split('_with')[0])
    os.makedirs(output_dir, exist_ok=True)

    for idx, text in tqdm(enumerate(data[i].Summary), desc=file_name[i]):
        try:
            filename = os.path.join(output_dir, f"summary_{idx+1}.wav")
            if isinstance(text, str) and text.strip():
                tts.tts_to_file(text=text, file_path=filename)
        except Exception as e:
            print(f"Error in row {idx+1}: {e}")
