import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

import { PostsService } from '../../services/posts.service';
import type { Post } from '../../types/post.types';

import type { ApiError } from '../../../../shared/http/types';
import { normalizeHttpError } from '../../../../shared/http/normalize-error';

import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

import { PostDetailLayoutComponent } from '../../components/post-detail-layout/post-detail-layout.component';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DotsLoaderComponent, PostDetailLayoutComponent],
  templateUrl: './post-detail.page.html',
})
export class PostDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private toast = inject(ToastService);
  private session = inject(AuthSessionService);

  private subRoute?: Subscription;
  private subRequest?: Subscription;

  private cdr = inject(ChangeDetectorRef);

  post: Post | null = null;
  isLoading = false;
  error: ApiError | null = null;

  ngOnInit(): void {
    const hasSession = this.session.isAuthenticated();

    if (!hasSession) {
      this.toast.error('Inicie sesión para leer el post');
      this.router.navigateByUrl('/login');
      return;
    }

    // ✅ reaccionar a cambios de :id
    this.subRoute = this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
      )
      .subscribe((id) => {
        this.fetch(id);
        console.log(id);
      });
  }

  private fetch(id: string): void {
    this.subRequest?.unsubscribe();

    this.error = null;
    this.post = null;
    this.isLoading = true;

    this.subRequest = this.postsService.getById(id).subscribe({
      next: (p) => {
        this.post = p;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.error = normalizeHttpError(e);
        console.log(e);
        this.subRequest?.unsubscribe();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    console.log('🔥 PostDetailPage destruido');
    this.subRoute?.unsubscribe();
    this.subRequest?.unsubscribe();
  }
}
