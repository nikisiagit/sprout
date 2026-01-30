export type Status = 'new' | 'in-progress' | 'rejected' | 'done';

export interface User {
  id: string;
  name: string;
  avatar: string; // URL or initials
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: Status;
  voteCount: number;
  comments: Comment[];
  createdAt: string;
}
