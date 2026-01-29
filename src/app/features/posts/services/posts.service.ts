import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import type {
  CreatePostRequest,
  ListPostsParams,
  Paginated,
  Post,
  PostApi,
  UpdatePostRequest,
} from '../types/post.types';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

const mapPost = (p: PostApi): Post => ({
  ...p,
  created_at: new Date(p.created_at),
  updated_at: new Date(p.updated_at),
});

const mapPaginated = (data: Paginated<PostApi>): Paginated<Post> => ({
  ...data,
  items: data.items.map(mapPost),
});

function buildParams(params?: ListPostsParams) {
  let hp = new HttpParams();
  if (!params) return hp;

  if (params.page != null) hp = hp.set('page', String(params.page));
  if (params.limit != null) hp = hp.set('limit', String(params.limit));
  if (params.q) hp = hp.set('q', params.q);
  if (params.tag) hp = hp.set('tag', params.tag);

  return hp;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);

  listFeed(params?: ListPostsParams) {
    return this.http
      .get<Paginated<PostApi>>(`${environment.apiUrl}/posts`, {
        params: buildParams(params),
      })
      .pipe(map(mapPaginated));
  }

  listMine(params?: ListPostsParams) {
    return this.http
      .get<Paginated<PostApi>>(`${environment.apiUrl}/posts/me`, {
        params: buildParams(params),
      })
      .pipe(map(mapPaginated));
  }

  create(payload: CreatePostRequest) {
    const fd = new FormData();

    fd.append('title', payload.title);
    fd.append('content', payload.content);

    if (payload.excerpt) fd.append('excerpt', payload.excerpt);
    if (payload.status) fd.append('status', payload.status);
    if (payload.tags?.length) fd.append('tags', payload.tags.join(','));
    if (payload.cover) fd.append('cover', payload.cover);

    return this.http.post<PostApi>(`${environment.apiUrl}/posts`, fd).pipe(map(mapPost));
  }

  update(postId: string, payload: UpdatePostRequest) {
    const fd = new FormData();

    if (payload.title !== undefined) fd.append('title', payload.title);
    if (payload.content !== undefined) fd.append('content', payload.content);

    if (payload.excerpt !== undefined) fd.append('excerpt', payload.excerpt ?? '');
    if (payload.status !== undefined) fd.append('status', payload.status);
    if (payload.tags !== undefined) fd.append('tags', payload.tags.join(','));

    if (payload.removeCover !== undefined) fd.append('removeCover', String(payload.removeCover));

    if (payload.cover) fd.append('cover', payload.cover);

    return this.http.patch<PostApi>(`${environment.apiUrl}/posts/${postId}`, fd).pipe(map(mapPost));
  }

  remove(postId: string) {
    return this.http.delete<{ ok: true }>(`${environment.apiUrl}/posts/${postId}`);
  }

  getById(postId: string) {
    return this.http.get<PostApi>(`${environment.apiUrl}/posts/${postId}`).pipe(map(mapPost));
  }
}
