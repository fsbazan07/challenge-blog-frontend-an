import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

type GuardConfig = {
  allowedChar?: RegExp;
  sanitize?: (s: string) => string;
  allowSpaces?: boolean;
};

const CONTROL_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

@Directive({
  selector: '[appInputGuard]',
  standalone: true,
})
export class InputGuardDirective {
  @Input('appInputGuard') config!: GuardConfig;

  @Input() guardMode: 'block' | 'sanitize' = 'block';

  private elementRef = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  private setValueKeepingCursor(next: string, cursor: number) {
    const el = this.el;
    el.value = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));

    queueMicrotask(() => {
      try {
        const pos = Math.min(cursor, next.length);
        el.setSelectionRange(pos, pos);
      } catch (err) {
        void err;
      }
    });
  }

  private get el(): HTMLInputElement | HTMLTextAreaElement {
    return this.elementRef.nativeElement as HTMLInputElement | HTMLTextAreaElement;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.config) return;

    if (CONTROL_KEYS.has(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;

    if (e.isComposing) return;

    const key = e.key;

    const allowSpaces = this.config.allowSpaces ?? true;
    if (allowSpaces && key === ' ') return;

    if (this.config.allowedChar && !this.config.allowedChar.test(key)) {
      e.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    if (!this.config?.sanitize) return;

    const text = e.clipboardData?.getData('text') ?? '';
    const cleaned = this.config.sanitize(text);

    if (cleaned !== text) {
      e.preventDefault();

      const start = this.el.selectionStart ?? this.el.value.length;
      const end = this.el.selectionEnd ?? this.el.value.length;

      const next = this.el.value.slice(0, start) + cleaned + this.el.value.slice(end);
      this.el.value = next;

      this.el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('input')
  onInput() {
    if (this.guardMode !== 'sanitize') return;
    if (!this.config?.sanitize) return;

    const current = this.el.value;
    const cleaned = this.config.sanitize(current);

    if (cleaned !== current) {
      const pos = this.el.selectionStart ?? cleaned.length;
      this.el.value = cleaned;
      this.el.setSelectionRange(Math.min(pos, cleaned.length), Math.min(pos, cleaned.length));

      this.el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('beforeinput', ['$event'])
  onBeforeInput(e: InputEvent) {
    if (!this.config) return;

    // solo cuando se inserta texto
    if (!e.data) return;

    const sanitize = this.config.sanitize;
    if (!sanitize) return;

    const el = this.el;
    const current = el.value ?? '';
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;

    const proposed = current.slice(0, start) + e.data + current.slice(end);
    const cleaned = sanitize(proposed);

    if (cleaned !== proposed) {
      e.preventDefault();
      this.setValueKeepingCursor(cleaned, start); // helper abajo
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    if (!this.config?.sanitize) return;

    const text = e.dataTransfer?.getData('text') ?? '';
    if (!text) return;

    const cleaned = this.config.sanitize(text);
    if (cleaned !== text) {
      e.preventDefault();

      const el = this.el;
      const current = el.value ?? '';
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;

      const next = current.slice(0, start) + cleaned + current.slice(end);
      this.setValueKeepingCursor(next, start + cleaned.length);
    }
  }
}
