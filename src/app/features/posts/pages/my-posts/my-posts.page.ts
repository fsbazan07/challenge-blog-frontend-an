import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostsService } from '../../services/posts.service';
import type { Post } from '../../types/post.types';

import type { ApiError } from '../../../../shared/http/types';
import { normalizeHttpError } from '../../../../shared/http/normalize-error';

import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

import { PostToolbarComponent } from '../../components/post-toolbar/post-toolbar.component';
import { PostCardComponent } from '../../components/post-card/post-card.component';

import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { ConfirmModalComponent } from '../../../../shared/ui/confirm-modal/confirm-modal.component';
import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';

import { resolveCover } from '../../services/posts.assets';

@Component({
  selector: 'app-my-posts-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostToolbarComponent,
    PostCardComponent,
    ButtonComponent,
    PaginationComponent,
    ConfirmModalComponent,
    DotsLoaderComponent,
  ],
  templateUrl: './my-posts.page.html',
})
export class MyPostsPage implements OnInit, OnDestroy {
  private postsService = inject(PostsService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private session = inject(AuthSessionService);

  private subList?: Subscription;
  private subDelete?: Subscription;

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

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

  confirmOpen = false;
  selectedPostId: string | null = null;
  isDeleting = false;

  ngOnInit(): void {
    if (!this.session.isAuthenticated()) {
      this.toast.error('Inicie sesión para ver sus posts');
      this.router.navigateByUrl('/login');
      return;
    }

    this.fetchMine();
  }

  private clearError(): void {
    this.error = null;
  }

  fetchMine(): void {
    this.subList?.unsubscribe();

    this.clearError();

    this.zone.run(() => {
      this.isLoading = true;
      this.cdr.markForCheck();
    });

    this.subList = this.postsService
      .listMine({
        page: this.page,
        limit: this.limit,
        q: this.q.trim() || undefined,
        tag: this.tag.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.items = res.items;
            this.total = res.total;
            this.totalPages = Math.ceil(res.total / this.limit);
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          const err = normalizeHttpError(e);

          this.zone.run(() => {
            this.error = err;
            this.isLoading = false;
            this.cdr.markForCheck();
          });

          this.toast.error(err.message || 'Error al cargar tus posts');
        },
      });
  }

  setQ(v: string): void {
    this.q = v;
    this.page = 1;
    this.fetchMine();
  }

  goToPage(p: number): void {
    const safe = Math.max(1, Math.min(p, this.totalPages || 1));
    this.page = safe;
    this.fetchMine();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchMine();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchMine();
    }
  }

  // -------- actions --------
  openConfirm(postId: string): void {
    this.selectedPostId = postId;
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    this.confirmOpen = false;
    this.selectedPostId = null;
  }

  deletePost(): void {
    if (!this.selectedPostId || this.isDeleting) return;

    this.subDelete?.unsubscribe();

    this.isDeleting = true;
    this.clearError();

    const id = this.selectedPostId;

    this.subDelete = this.postsService.remove(id).subscribe({
      next: () => {
        this.zone.run(() => {
          this.isDeleting = false;
          this.closeConfirm();
          this.cdr.markForCheck();
        });

        this.toast.success('Post eliminado correctamente');
        this.fetchMine();
      },
      error: (e) => {
        const err = normalizeHttpError(e);

        this.zone.run(() => {
          this.error = err;
          this.isDeleting = false;
          this.cdr.markForCheck();
        });

        this.toast.error(err.message || 'No se pudo eliminar el post');
      },
    });
  }

  ngOnDestroy(): void {
    this.subList?.unsubscribe();
    this.subDelete?.unsubscribe();
  }
}
