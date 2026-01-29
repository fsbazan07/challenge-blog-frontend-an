import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import type { Post } from '../../types/post.types';
import { resolveCover } from '../../services/posts.assets';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { formatAR } from '../../../../shared/utils/helpers/date-format';

@Component({
  selector: 'app-post-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './post-detail-layout.component.html',
})
export class PostDetailLayoutComponent {
  @Input({ required: true }) post!: Post;

  resolveCover = resolveCover;
  formatAR = formatAR;

  get authorName(): string {
    return this.post.author?.name ?? '—';
  }

  get cover(): string | null {
    return this.resolveCover(this.post.coverUrl);
  }
}
