DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS ideas;

CREATE TABLE ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  vote_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  space_slug TEXT NOT NULL
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL,
  idea_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_ideas_space ON ideas(space_slug);
CREATE INDEX idx_comments_idea ON comments(idea_id);
