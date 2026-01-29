import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PostsService } from '../../services/posts.service';
import { resolveCover } from '../../services/posts.assets';

import type { Post } from '../../types/post.types';
import type { ApiError } from '../../../../shared/http/types';
import { normalizeHttpError } from '../../../../shared/http/normalize-error';

import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostToolbarComponent } from '../../components/post-toolbar/post-toolbar.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostCardComponent,
    PostToolbarComponent,
    ButtonComponent,
    PaginationComponent,
    DotsLoaderComponent,
  ],
  templateUrl: './feed.page.html',
})
export class FeedPage implements OnInit {
  private postsService = inject(PostsService);
  private reqId = 0;
  private cdr = inject(ChangeDetectorRef);
  private sub: Subscription | null = null;

  resolveCover = resolveCover;

  items: Post[] = [];

  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  q = '';
  tag = '';

  isLoading = false;
  error: ApiError | null = null;

  ngOnInit(): void {
    this.fetchFeed();
  }

  private clearError(): void {
    this.error = null;
  }

  fetchFeed(): void {
    this.sub?.unsubscribe();

    this.clearError();
    this.isLoading = true;

    const id = ++this.reqId;

    this.sub = this.postsService
      .listFeed({
        page: this.page,
        limit: this.limit,
        q: this.q.trim() || undefined,
        tag: this.tag.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          if (id !== this.reqId) return; // respuesta vieja

          this.items = res.items;
          this.total = res.total;
          this.totalPages = Math.ceil(res.total / this.limit);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (e) => {
          if (id !== this.reqId) return;

          this.error = normalizeHttpError(e);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
  setQ(v: string): void {
    this.q = v;
    this.page = 1;
    this.fetchFeed();
  }

  goToPage(p: number): void {
    const safe = Math.max(1, Math.min(p, this.totalPages || 1));
    this.page = safe;
    this.fetchFeed();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchFeed();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchFeed();
    }
  }
}
