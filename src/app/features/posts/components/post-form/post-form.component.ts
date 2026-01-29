import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';
import { ngGuards } from '../../../../shared/directives/guards';
import { InputGuardDirective } from '../../../../shared/directives/input-guard.directive';

export type PostFormVm = {
  title: string;
  excerpt: string;
  content: string;
  tagsInput: string;
  tags: string[];

  coverUrl: string;
  coverFile: File | null;
  coverPreviewUrl: string | null;
  coverError: string | null;
  isDraggingCover: boolean;

  isSubmitting: boolean;
  error: string | null;
  titleError: string | null;
  contentError: string | null;

  mode: 'create' | 'edit';
  postId: string | null;
  isLoading: boolean;
};

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DotsLoaderComponent, InputGuardDirective],
  templateUrl: './post-form.component.html',
})
export class PostFormComponent {
  ngGuards = ngGuards;
  @Input({ required: true }) vm!: PostFormVm;

  @Output() titleChange = new EventEmitter<string>();
  @Output() excerptChange = new EventEmitter<string>();
  @Output() contentChange = new EventEmitter<string>();
  @Output() tagsInputChange = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();

  @Output() coverFromInput = new EventEmitter<File | undefined>();
  @Output() clearCover = new EventEmitter<void>();

  @Output() coverDrop = new EventEmitter<DragEvent>();
  @Output() coverDragOver = new EventEmitter<DragEvent>();
  @Output() coverDragEnter = new EventEmitter<DragEvent>();
  @Output() coverDragLeave = new EventEmitter<DragEvent>();

  @Output() saveDraft = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();

  onFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    this.coverFromInput.emit(file);
  }
}
