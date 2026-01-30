import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostsService } from '../../services/posts.service';
import { resolveCover } from '../../services/posts.assets';
import type { Post } from '../../types/post.types';

import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';
import { normalizeHttpError } from '../../../../shared/http/normalize-error';

import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';
import { PostFormComponent, PostFormVm } from '../../components/post-form/post-form.component';
import { PostPreviewComponent } from '../../components/post-preview/post-preview.component';
import { userStorage } from '../../../../shared/http/user-storage';

@Component({
  selector: 'app-post-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DotsLoaderComponent,
    PostFormComponent,
    PostPreviewComponent,
  ],
  templateUrl: './post-editor.page.html',
})
export class PostEditorPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private toast = inject(ToastService);
  private session = inject(AuthSessionService);

  // 👇 para evitar el “tengo que clickear 2 veces”
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private subLoad?: Subscription;
  private subSave?: Subscription;

  // estado (sin store, como venimos)
  vm: PostFormVm = {
    title: '',
    excerpt: '',
    content: '',
    tagsInput: '',
    tags: [],
    coverUrl: '',
    coverFile: null,
    coverPreviewUrl: null,
    coverError: null,
    isDraggingCover: false,

    isSubmitting: false,
    error: null,
    titleError: null,
    contentError: null,

    mode: 'create',
    postId: null,
    isLoading: false,
  };

  ngOnInit(): void {
    // 🔒 auth gate
    if (!this.session.isAuthenticated()) {
      this.toast.error('Inicie sesión para crear/editar un post');
      this.router.navigateByUrl('/login');
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadForEdit(id);
    }
  }

  // ---------------------------
  // helpers
  // ---------------------------
  private syncTags(raw: string): void {
    const list = raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);

    this.vm.tags = list;
  }

  private validate(): boolean {
    this.vm.titleError = null;
    this.vm.contentError = null;

    const t = this.vm.title.trim();
    const c = this.vm.content.trim();

    let ok = true;

    if (!t) {
      this.vm.titleError = 'El título es requerido.';
      ok = false;
    } else if (t.length > 120) {
      this.vm.titleError = 'Máximo 120 caracteres.';
      ok = false;
    }

    if (!c) {
      this.vm.contentError = 'El contenido es requerido.';
      ok = false;
    } else if (c.length < 30) {
      this.vm.contentError = 'Escribí un poco más (mínimo 30 caracteres).';
      ok = false;
    }

    return ok;
  }

  private setCoverImage(file: File | null): void {
    this.vm.coverError = null;

    // clear
    if (!file) {
      this.vm.coverFile = null;
      if (this.vm.coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(this.vm.coverPreviewUrl);
      }
      this.vm.coverPreviewUrl = null;
      this.cdr.markForCheck();
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.vm.coverError = 'Formato no soportado. Usá JPG, PNG o WEBP.';
      this.cdr.markForCheck();
      return;
    }

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      this.vm.coverError = `La imagen supera los ${maxMB}MB.`;
      this.cdr.markForCheck();
      return;
    }

    this.vm.coverFile = file;

    if (this.vm.coverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.vm.coverPreviewUrl);
    }
    this.vm.coverPreviewUrl = URL.createObjectURL(file);
    this.cdr.markForCheck();
  }

  private hydrateFromPost(p: Post): void {
    this.vm.title = p.title ?? '';
    this.vm.excerpt = p.excerpt ?? '';
    this.vm.content = p.content ?? '';
    this.vm.tags = p.tags ?? [];
    this.vm.tagsInput = (p.tags ?? []).join(', ');

    const url = resolveCover(p.coverUrl ?? '');
    this.vm.coverUrl = url ?? '';
    this.vm.coverFile = null;

    if (this.vm.coverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.vm.coverPreviewUrl);
    }
    this.vm.coverPreviewUrl = url || null;

    this.vm.error = null;
    this.vm.titleError = null;
    this.vm.contentError = null;
    this.vm.coverError = null;
  }

  private resetFormAndGoBack(): void {
    if (this.vm.coverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.vm.coverPreviewUrl);
    }

    this.vm = {
      ...this.vm,
      title: '',
      excerpt: '',
      content: '',
      tagsInput: '',
      tags: [],
      coverUrl: '',
      coverFile: null,
      coverPreviewUrl: null,
      coverError: null,
      isDraggingCover: false,
      error: null,
      titleError: null,
      contentError: null,
      mode: 'create',
      postId: null,
      isLoading: false,
      isSubmitting: false,
    };

    this.router.navigateByUrl('/myposts');
  }

  // ---------------------------
  // load for edit + owner check
  // ---------------------------
  loadForEdit(id: string): void {
    this.subLoad?.unsubscribe();

    this.zone.run(() => {
      this.vm.isLoading = true;
      this.vm.error = null;
      this.cdr.markForCheck();
    });

    this.subLoad = this.postsService.getById(id).subscribe({
      next: (p) => {
        this.zone.run(() => {
          // 🔒 owner check
          const me = userStorage.get();
          const myId = me?.id;
          const ownerId = p.author?.id;

          if (!myId || !ownerId || myId !== ownerId) {
            this.toast.error('No tenés permisos para editar este post');
            this.router.navigateByUrl('/myposts');
            this.vm.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          this.vm.mode = 'edit';
          this.vm.postId = id;
          this.hydrateFromPost(p);
          this.vm.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (e) => {
        const err = normalizeHttpError(e);
        this.zone.run(() => {
          this.vm.error = err.message ?? 'No se pudo cargar el post.';
          this.vm.isLoading = false;
          this.cdr.markForCheck();
        });
        this.toast.error(err.message || 'No se pudo cargar el post');
      },
    });
  }

  // ---------------------------
  // bindings para PostForm
  // ---------------------------
  setTitle(v: string) {
    this.vm.title = v;
  }
  setExcerpt(v: string) {
    this.vm.excerpt = v;
  }
  setContent(v: string) {
    this.vm.content = v;
  }

  setTagsInput(v: string) {
    this.vm.tagsInput = v;
    this.syncTags(v);
  }

  removeTag(t: string) {
    this.vm.tags = this.vm.tags.filter((x) => x !== t);
    this.vm.tagsInput = this.vm.tags.join(', ');
  }

  clearCover() {
    this.setCoverImage(null);
  }

  setCoverFromInput(file?: File) {
    this.setCoverImage(file ?? null);
  }

  onCoverDrop(e: DragEvent) {
    e.preventDefault();
    this.vm.isDraggingCover = false;
    const file = (e.dataTransfer?.files?.[0] ?? null) as File | null;
    if (file) this.setCoverImage(file);
  }
  onCoverDragOver(e: DragEvent) {
    e.preventDefault();
  }
  onCoverDragEnter(e: DragEvent) {
    e.preventDefault();
    this.vm.isDraggingCover = true;
  }
  onCoverDragLeave(e: DragEvent) {
    e.preventDefault();
    this.vm.isDraggingCover = false;
  }

  // ---------------------------
  // submit actions
  // ---------------------------
  saveDraft(): void {
    this.submit('draft');
  }

  publish(): void {
    if (this.vm.mode === 'edit') {
      this.publishExisting();
      return;
    }

    this.submit('published'); // create normal
  }

  private submit(status: 'draft' | 'published'): void {
    this.vm.error = null;

    if (!this.validate()) {
      this.toast.error('Revisá los campos requeridos');
      return;
    }

    this.subSave?.unsubscribe();

    this.zone.run(() => {
      this.vm.isSubmitting = true;
      this.cdr.markForCheck();
    });

    this.subSave = this.postsService
      .create({
        title: this.vm.title.trim(),
        content: this.vm.content.trim(),
        excerpt: this.vm.excerpt.trim() || undefined,
        tags: this.vm.tags,
        status,
        cover: this.vm.coverFile,
      })
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.success(status === 'draft' ? 'Borrador guardado' : 'Post publicado');
          this.resetFormAndGoBack();
        },
        error: (e) => {
          const err = normalizeHttpError(e);
          this.zone.run(() => {
            this.vm.error = err.message ?? 'No se pudo guardar.';
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.error(err.message || 'No se pudo guardar');
        },
      });
  }

  private publishExisting(): void {
    this.vm.error = null;

    if (!this.validate()) {
      this.toast.error('Revisá los campos requeridos');
      return;
    }

    if (!this.vm.postId) {
      this.toast.error('No se encontró el post a publicar');
      return;
    }

    this.subSave?.unsubscribe();

    this.zone.run(() => {
      this.vm.isSubmitting = true;
      this.cdr.markForCheck();
    });

    this.subSave = this.postsService
      .update(this.vm.postId, {
        title: this.vm.title.trim(),
        content: this.vm.content.trim(),
        excerpt: this.vm.excerpt.trim() ? this.vm.excerpt.trim() : null,
        tags: this.vm.tags,

        status: 'published',
        cover: this.vm.coverFile ?? null,
        removeCover: !this.vm.coverFile && !this.vm.coverUrl,
      })
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.success('Post publicado correctamente');
          this.resetFormAndGoBack();
        },
        error: (e) => {
          const err = normalizeHttpError(e);
          this.zone.run(() => {
            this.vm.error = err.message ?? 'No se pudo publicar.';
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.error(err.message || 'No se pudo publicar');
        },
      });
  }

  update(): void {
    this.vm.error = null;

    if (!this.validate()) {
      this.toast.error('Revisá los campos requeridos');
      return;
    }

    if (!this.vm.postId) {
      this.toast.error('No se encontró el post a editar');
      return;
    }

    this.subSave?.unsubscribe();

    this.zone.run(() => {
      this.vm.isSubmitting = true;
      this.cdr.markForCheck();
    });

    this.subSave = this.postsService
      .update(this.vm.postId, {
        title: this.vm.title.trim(),
        content: this.vm.content.trim(),
        excerpt: this.vm.excerpt.trim() ? this.vm.excerpt.trim() : null,
        tags: this.vm.tags,
        cover: this.vm.coverFile ?? null,
        removeCover: !this.vm.coverFile && !this.vm.coverUrl,
      })
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.success('Post actualizado correctamente');
          this.resetFormAndGoBack();
        },
        error: (e) => {
          const err = normalizeHttpError(e);
          this.zone.run(() => {
            this.vm.error = err.message ?? 'No se pudo actualizar el post.';
            this.vm.isSubmitting = false;
            this.cdr.markForCheck();
          });
          this.toast.error(err.message || 'No se pudo actualizar el post');
        },
      });
  }

  ngOnDestroy(): void {
    this.subLoad?.unsubscribe();
    this.subSave?.unsubscribe();

    if (this.vm.coverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.vm.coverPreviewUrl);
    }
  }
}
