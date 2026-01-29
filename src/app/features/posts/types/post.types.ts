import { ApiError } from '../../../shared/http/types';

export type PostStatus = 'draft' | 'published' | 'deleted';

export type PostAuthor = {
  id: string;
  name: string;
  email: string;
};

export type PostApi = {
  id: string;
  title: string;
  excerpt: string | null;
  content?: string; // solo detail / edit
  coverUrl: string | null;
  tags: string[];
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author: PostAuthor | null;
};

export type Post = Omit<PostApi, 'created_at' | 'updated_at'> & {
  created_at: Date;
  updated_at: Date;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

// -------- Requests --------

export type ListPostsParams = {
  page?: number;
  limit?: number;
  q?: string;
  tag?: string;
};

export type CreatePostRequest = {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  status?: PostStatus;
  cover?: File | null;
};

export type UpdatePostRequest = {
  title?: string;
  content?: string;
  excerpt?: string | null;
  tags?: string[];
  status?: PostStatus;
  removeCover?: boolean;
  cover?: File | null;
};

// -------- Feed state --------

export type FeedSystem = {
  items: Post[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  q: string;
  tag: string;
  isLoading: boolean;
  error: ApiError | null;
};

export type FeedActions = {
  setQ: (v: string) => void;
  setTag: (v: string) => void;

  setPage: (v: number) => void;
  setLimit: (v: number) => void;

  goToPage: (p: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  fetch: () => void;
  refresh: () => void;
  clearFilters: () => void;
};
