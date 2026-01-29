import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { PostFormVm } from '../post-form/post-form.component';

@Component({
  selector: 'app-post-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-preview.component.html',
})
export class PostPreviewComponent {
  @Input({ required: true }) vm!: PostFormVm;

  get contentPreview(): string {
    const c = (this.vm.content ?? '').trim();
    if (!c) return 'Contenido del post...';
    return c.slice(0, 500) + (c.length > 500 ? '...' : '');
  }
}
