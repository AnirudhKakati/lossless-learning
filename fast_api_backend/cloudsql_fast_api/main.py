import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI() #initialize fast api connection

# enable CORS so frontend (on a different domain/port) can access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # will change "*" to our frontend domain for security
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

#set up password hashing context using bcrypt algorithm
#this will be used to securely hash user passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    """
    Establish and return a CloudSQL database connection using environment variables.

    Returns:
        connection (psycopg2.connection): A live connection to the CloudSQL database.
    """
    #get database connection parameters from environment variables with defaults
    host = os.getenv("DB_HOST")
    database = os.getenv("DB_NAME", "lossless_learning_db") #default database name if not specified
    user = os.getenv("DB_USER", "admin") #default user if not specified
    password = os.getenv("DB_PASS")
    port = os.getenv("DB_PORT", "5432") #default PostgreSQL port if not specified
    
    #check if its using a Unix socket (Cloud SQL)
    if host.startswith('/cloudsql/'):
        #connect using Unix socket for Cloud SQL
        conn = psycopg2.connect(dbname=database,user=user,password=password,host=host)
    else:
        # otherwise a standard TCP connection
        conn = psycopg2.connect(host=host,database=database,user=user,password=password,port=port)
    return conn

#pydantic model for user registration request validation
class UserCreate(BaseModel):
    email: str
    password: str

#pydantic model for user login request validation
class UserLogin(BaseModel):
    email: str
    password: str

#pydantic model for resource like/unlike operations
class ResourceLike(BaseModel):
    user_id: str
    resource_id: str

@app.post("/register")
def register_user(payload: UserCreate):
    """
    Register a new user by hashing their password and storing email + hash in the database.

    Args:
        payload (UserCreate): Contains email and plaintext password.

    Returns:
        dict: Success message and newly created user ID.

    Raises:
        HTTPException: If email already exists or a database error occurs.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()

        #first check if email already exists
        check_email_stmt = "SELECT user_id FROM users WHERE email = %s"
        cur.execute(check_email_stmt, (payload.email,))
        existing_user = cur.fetchone()
        
        if existing_user: #if email already exists, return error
            cur.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered! Please log in.")
        
        #hash the password using bcrypt before storing it
        hashed_pw = pwd_context.hash(payload.password)

        #insert the new user into the database
        insert_stmt = """
            INSERT INTO users (email, password_hash)
            VALUES (%s, %s)
            RETURNING user_id
        """
        cur.execute(insert_stmt, (payload.email, hashed_pw))

        #get the newly created user ID
        new_user_id = cur.fetchone()[0]

        #commit the transaction and close connection
        conn.commit()
        cur.close()
        conn.close()
        #return success message with the new user ID
        return {"message": "User registered successfully!", "user_id": str(new_user_id)}
    except psycopg2.Error as e:
        #handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.post("/login")
def login_user(payload: UserLogin):
    """
    Log in a user by verifying the provided credentials against stored hashed password.

    Args:
        payload (UserLogin): Contains email and plaintext password.

    Returns:
        dict: Success message and user ID if login succeeds.

    Raises:
        HTTPException: If email does not exist or password is incorrect.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()

        #look up the user by email
        cur.execute("SELECT user_id, password_hash FROM users WHERE email = %s", (payload.email,))
        result = cur.fetchone()
        cur.close()
        conn.close()

        #if no user found with this email, return error
        if not result:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        #extract user ID and stored password hash
        user_id, stored_hash = result
        #verify the provided password against the stored hash
        if not pwd_context.verify(payload.password, stored_hash):
            #if password doesn't match, return error
            raise HTTPException(status_code=401, detail="Invalid email or password")

        #return success message with user ID
        return {"message": "Login successful!", "user_id": str(user_id)}
    except psycopg2.Error as e:
        #handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.post("/like")
def like_resource(like_data: ResourceLike):
    """
    Like a resource for a user. Adds to `user_likes`, and increments the like count in `resource_likes`.

    Args:
        like_data (ResourceLike): Contains user_id and resource_id.

    Returns:
        dict: Success message.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()

        #insert a record in the user_likes junction table
        # ON CONFLICT DO NOTHING ensures we don't create duplicate likes
        insert_like = """
            INSERT INTO user_likes (user_id, resource_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, resource_id) DO NOTHING
        """
        cur.execute(insert_like, (like_data.user_id, like_data.resource_id))

        #update (or create) the like count for this resource
        #if the resource doesn't exist in the table, create with count 1
        #if it exists, increment the counter by 1
        update_resource_likes = """
            INSERT INTO resource_likes (resource_id, like_count)
            VALUES (%s, 1)
            ON CONFLICT (resource_id)
            DO UPDATE SET like_count = resource_likes.like_count + 1
        """
        cur.execute(update_resource_likes, (like_data.resource_id,))
        
        #commit the transaction and close connection
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Resource liked successfully!"}

    except psycopg2.Error as e:
        #handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")

@app.post("/unlike")
def unlike_resource(like_data: ResourceLike):
    """
    Unlike a resource. Removes from `user_likes` and decrements like count in `resource_likes` if it exists.

    Args:
        like_data (ResourceLike): Contains user_id and resource_id.

    Returns:
        dict: Success or no-op message.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()
        
        # try to delete the like record from user_likes
        # RETURNING * clause makes the query return the deleted row if successful
        delete_like = """
            DELETE FROM user_likes
            WHERE user_id = %s AND resource_id = %s
            RETURNING *
        """
        cur.execute(delete_like, (like_data.user_id, like_data.resource_id))
        deleted_row = cur.fetchone()

        # if we actually removed a like (deleted_row is not None), decrement the resource_likes count
        if deleted_row:
            # GREATEST ensures the count never goes below zero
            update_resource_likes = """
                UPDATE resource_likes
                SET like_count = GREATEST(like_count - 1, 0)
                WHERE resource_id = %s
            """
            cur.execute(update_resource_likes, (like_data.resource_id,))

        #commit the transaction and close connection
        conn.commit()
        cur.close()
        conn.close()

        #return appropriate message based on whether a like was actually removed
        if deleted_row:
            return {"message": "Resource unliked successfully!"}
        else:
            return {"message": "No existing like found for this user/resource."}
        
    except psycopg2.Error as e:
        # handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.get("/users/{user_id}/likes")
def get_user_liked_resources(user_id: str):
    """
    Get a list of resource IDs that a user has liked.

    Args:
        user_id (str): UUID of the user.

    Returns:
        list: List of resource_id strings the user liked.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()

        #query to get all resources a user has liked
        query = """
            SELECT resource_id
            FROM user_likes
            WHERE user_id = %s
        """
        cur.execute(query, (user_id,))
        rows = cur.fetchall()

        #close connection
        cur.close()
        conn.close()

        #convert query results to a list of resource IDs
        #each row is a tuple with one element (the resource_id)
        resource_ids = [row[0] for row in rows]
        return resource_ids

    except psycopg2.Error as e:
        #handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    
@app.get("/resources/{resource_id}/likes")
def get_resource_like_count(resource_id: str):
    """
    Get the total number of likes for a specific resource.

    Args:
        resource_id (str): UUID of the resource.

    Returns:
        dict: Dictionary containing the resource_id and its total like count.
    """

    try:
        conn = get_db_connection() #get database connection
        cur = conn.cursor()

        #query to get the like count for the specified resource
        query = """
            SELECT like_count
            FROM resource_likes
            WHERE resource_id = %s
        """
        cur.execute(query, (resource_id,))
        result = cur.fetchone()

        #close connection
        cur.close()
        conn.close()

        #if resource exists in the likes table, return its count, otherwise return 0
        like_count = result[0] if result else 0
        return {"resource_id": resource_id, "like_count": like_count}

    except psycopg2.Error as e:
        #handle database errors
        raise HTTPException(status_code=400, detail=f"Database error: {e}")