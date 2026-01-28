import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type LoaderTone = 'primary' | 'secondary';

@Component({
  selector: 'app-dots-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center w-full h-full" role="status" aria-label="Cargando">
      @for (_ of dots; track $index; let i = $index) {
        <span
          class="rounded-full animate-dots"
          [ngClass]="[sizeClass, colorClass, delayClass(i)]"
        ></span>
      }
    </div>
  `,
})
export class DotsLoaderComponent {
  /** Cantidad de puntos */
  @Input() count = 3;

  /** Tamaño del loader */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Tono visual del loader */
  @Input() tone: LoaderTone = 'primary';

  get dots() {
    return Array.from({ length: this.count });
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'h-2 w-2 mx-1';
      case 'lg':
        return 'h-4 w-4 mx-1.5';
      case 'md':
      default:
        return 'h-2.5 w-2.5 mx-1';
    }
  }

  get colorClass(): string {
    return this.tone === 'secondary' ? 'bg-primary' : 'bg-primary-foreground/70';
  }

  delayClass(i: number): string {
    const delays = [
      'animate-delay-0',
      'animate-delay-150',
      'animate-delay-300',
      'animate-delay-450',
      'animate-delay-600',
    ];
    return delays[i % delays.length];
  }
}
