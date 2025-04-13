-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER_LIKES table
CREATE TABLE IF NOT EXISTS user_likes (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, resource_id)
);

-- RESOURCE_LIKES table
CREATE TABLE IF NOT EXISTS resource_likes (
    resource_id TEXT PRIMARY KEY,
    like_count INT DEFAULT 0
);