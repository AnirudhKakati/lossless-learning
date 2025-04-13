import os
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    host = os.getenv("DB_HOST")
    database = os.getenv("DB_NAME", "lossless_learning_db")
    user = os.getenv("DB_USER", "admin")
    password = os.getenv("DB_PASS")
    port = os.getenv("DB_PORT", "5432")
    
    # Check if we're using a Unix socket (Cloud SQL)
    if host.startswith('/cloudsql/'):
        conn = psycopg2.connect(
            dbname=database,
            user=user,
            password=password,
            host=host,  # This will be like /cloudsql/PROJECT:REGION:INSTANCE
        )
    else:
        # Standard connection
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
    return conn

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ResourceLike(BaseModel):
    user_id: str
    resource_id: str

@app.post("/register")
def register_user(payload: UserCreate):
    hashed_pw = pwd_context.hash(payload.password)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        insert_stmt = """
            INSERT INTO users (email, password_hash)
            VALUES (%s, %s)
            RETURNING user_id
        """
        cur.execute(insert_stmt, (payload.email, hashed_pw))
        new_user_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()
        return {"message": "User registered successfully!", "user_id": str(new_user_id)}
    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.post("/login")
def login_user(payload: UserLogin):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT user_id, password_hash FROM users WHERE email = %s", (payload.email,))
        result = cur.fetchone()
        cur.close()
        conn.close()

        if not result:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id, stored_hash = result
        if not pwd_context.verify(payload.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {"message": "Login successful!", "user_id": str(user_id)}
    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.post("/like")
def like_resource(like_data: ResourceLike):
    """
    Inserts or ignores into user_likes.
    Increments the resource_likes table’s like_count (upsert).
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        insert_like = """
            INSERT INTO user_likes (user_id, resource_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, resource_id) DO NOTHING
        """
        cur.execute(insert_like, (like_data.user_id, like_data.resource_id))

        update_resource_likes = """
            INSERT INTO resource_likes (resource_id, like_count)
            VALUES (%s, 1)
            ON CONFLICT (resource_id)
            DO UPDATE SET like_count = resource_likes.like_count + 1
        """
        cur.execute(update_resource_likes, (like_data.resource_id,))

        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Resource liked successfully!"}

    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")

@app.post("/unlike")
def unlike_resource(like_data: ResourceLike):
    """
    Deletes an entry from user_likes (if it exists).
    Decrements resource_likes table’s like_count if > 0.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        delete_like = """
            DELETE FROM user_likes
            WHERE user_id = %s AND resource_id = %s
            RETURNING *
        """
        cur.execute(delete_like, (like_data.user_id, like_data.resource_id))
        deleted_row = cur.fetchone()

        # If we actually removed a row, decrement the resource_likes count
        if deleted_row:
            update_resource_likes = """
                UPDATE resource_likes
                SET like_count = GREATEST(like_count - 1, 0)
                WHERE resource_id = %s
            """
            cur.execute(update_resource_likes, (like_data.resource_id,))

        conn.commit()
        cur.close()
        conn.close()

        if deleted_row:
            return {"message": "Resource unliked successfully!"}
        else:
            return {"message": "No existing like found for this user/resource."}
        
    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.get("/users/{user_id}/likes")
def get_user_liked_resources(user_id: str):
    """
    Returns a list of resource_ids that this user has liked.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            SELECT resource_id
            FROM user_likes
            WHERE user_id = %s
        """
        cur.execute(query, (user_id,))
        rows = cur.fetchall()

        cur.close()
        conn.close()

        # Convert each row (which is just a single column) into a list of resource_ids
        resource_ids = [row[0] for row in rows]
        return resource_ids

    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail=f"Database error: {e}")