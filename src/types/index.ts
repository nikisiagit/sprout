export type Status = 'new' | 'in-progress' | 'rejected' | 'done';

export interface User {
  id: string;
  name: string;
  avatar: string; // URL or initials
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: Status;
  voteCount: number;
  commentCount: number;
  author: User;
  createdAt: string;
}
