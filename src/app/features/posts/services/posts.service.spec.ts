import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PostsService } from './posts.service';
import { environment } from '../../../../environments/environment';
import type { Paginated, PostApi } from '../types/post.types';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('listFeed: should call GET /posts with params and map dates to Date', () => {
    const apiResponse: Paginated<PostApi> = {
      page: 1,
      limit: 10,
      total: 1,
      items: [
        {
          id: 'p1',
          title: 'Hello',
          excerpt: null,
          content: undefined,
          coverUrl: null,
          tags: [],
          status: 'published',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-02T00:00:00.000Z',
          author: null,
        },
      ],
    };

    service.listFeed({ page: 1, limit: 10, q: 'hi', tag: 'angular' }).subscribe((res) => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].created_at instanceof Date).toBe(true);
      expect(res.items[0].updated_at instanceof Date).toBe(true);
      expect(res.items[0].created_at.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${API}/posts`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('q')).toBe('hi');
    expect(req.request.params.get('tag')).toBe('angular');

    req.flush(apiResponse);
  });

  it('listMine: should call GET /posts/me and map dates', () => {
    const apiResponse: Paginated<PostApi> = {
      page: 1,
      limit: 10,
      total: 0,
      items: [],
    };

    service.listMine({ page: 2 }).subscribe((res) => {
      expect(res.items).toEqual([]);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${API}/posts/me`);
    expect(req.request.params.get('page')).toBe('2');

    req.flush(apiResponse);
  });

  it('getById: should call GET /posts/:id and map dates', () => {
    const apiPost: PostApi = {
      id: 'p1',
      title: 'Hello',
      excerpt: null,
      content: 'World', // para detail/edit sí puede venir
      coverUrl: null,
      tags: [],
      status: 'draft',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      author: null,
    };

    service.getById('p1').subscribe((post) => {
      expect(post.id).toBe('p1');
      expect(post.created_at instanceof Date).toBe(true);
      expect(post.updated_at instanceof Date).toBe(true);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${API}/posts/p1`);
    req.flush(apiPost);
  });

  it('remove: should call DELETE /posts/:id', () => {
    service.remove('p1').subscribe((res) => {
      expect(res.ok).toBe(true);
    });

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${API}/posts/p1`);
    req.flush({ ok: true });
  });

  it('create: should POST FormData to /posts (with optional fields)', () => {
    const file = new Blob(['x'], { type: 'text/plain' }) as unknown as File;

    service
      .create({
        title: 'T',
        content: 'C',
        excerpt: 'E',
        status: 'published',
        tags: ['a', 'b'],
        cover: file,
      })
      .subscribe((post) => {
        expect(post.created_at instanceof Date).toBe(true);
      });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/posts`);
    expect(req.request.body instanceof FormData).toBe(true);

    const fd = req.request.body as FormData;
    expect(fd.get('title')).toBe('T');
    expect(fd.get('content')).toBe('C');
    expect(fd.get('excerpt')).toBe('E');
    expect(fd.get('status')).toBe('published');
    expect(fd.get('tags')).toBe('a,b');
    expect(fd.get('cover')).toBeTruthy();

    const apiPost: PostApi = {
      id: 'p1',
      title: 'T',
      excerpt: 'E',
      content: 'C',
      coverUrl: null,
      tags: ['a', 'b'],
      status: 'published',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      author: null,
    };

    req.flush(apiPost);
  });

  it('update: should PATCH FormData to /posts/:id (handle removeCover & tags)', () => {
    service
      .update('p1', {
        title: 'New',
        excerpt: null,
        tags: ['x', 'y'],
        removeCover: true,
      })
      .subscribe((post) => {
        expect(post.id).toBe('p1');
      });

    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url === `${API}/posts/p1`);
    expect(req.request.body instanceof FormData).toBe(true);

    const fd = req.request.body as FormData;
    expect(fd.get('title')).toBe('New');
    expect(fd.get('excerpt')).toBe(''); // null => '' por tu service
    expect(fd.get('tags')).toBe('x,y');
    expect(fd.get('removeCover')).toBe('true');

    const apiPost: PostApi = {
      id: 'p1',
      title: 'New',
      excerpt: '',
      content: 'old',
      coverUrl: null,
      tags: ['x', 'y'],
      status: 'draft',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      author: null,
    };

    req.flush(apiPost);
  });
});
