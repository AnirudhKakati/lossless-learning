FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

WORKDIR /app

#install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#copy source code
COPY . .

#nothing else needed – the base image will run the app with Gunicorn + Uvicorn