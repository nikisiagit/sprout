DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS ideas;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS spaces;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  salt TEXT,
  google_id TEXT UNIQUE,
  is_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL, -- references users(public_id)
  created_at INTEGER NOT NULL
);

CREATE TABLE ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  vote_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  space_slug TEXT NOT NULL,
  jira_issue_key TEXT,
  author_id TEXT -- nullable, for logged in users
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  idea_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  author_id TEXT -- nullable
);

CREATE INDEX idx_ideas_space ON ideas(space_slug);
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google ON users(google_id);
