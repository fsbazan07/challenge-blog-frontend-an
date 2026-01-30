import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { formatAR } from '../../../../shared/utils/helpers/date-format';
import { PostStatus } from '../../types/post.types';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.component.html',
})
export class PostCardComponent {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) title!: string;

  @Input() excerpt?: string | null;
  @Input() authorName?: string | null;
  @Input() createdAt?: string | null | Date;
  @Input() coverUrl?: string | null;
  @Input() tags: string[] = [];

  @Input() status?: PostStatus;
  @Input() showStatus = false;

  formatAR = formatAR;
}
