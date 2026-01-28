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

  private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  private get el(): HTMLInputElement {
    return this.elementRef.nativeElement as HTMLInputElement;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.config) return;

    if (CONTROL_KEYS.has(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;

    if (e.isComposing) return;

    const key = e.key;

    if (key.length !== 1) return;

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
}
