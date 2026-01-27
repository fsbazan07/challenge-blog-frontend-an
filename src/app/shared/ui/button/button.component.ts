import { Component, Input, HostBinding } from '@angular/core';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  /** Permite pasar class="" desde afuera */
  @Input() class = '';

  /** Clases base (idénticas a React) */
  private base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  private variants: Record<Variant, string> = {
    primary:
      'bg-primary text-primary-foreground hover:opacity-90 active:opacity-95',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-muted active:bg-muted',
    outline:
      'border border-border bg-transparent text-foreground hover:bg-muted',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
  };

  private sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
  };

  @HostBinding('class')
  get hostClasses(): string {
    return [
      this.base,
      this.variants[this.variant],
      this.sizes[this.size],
      this.fullWidth && 'w-full',
      this.class,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
