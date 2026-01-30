import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="fixed right-4 bottom-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      @for (t of (toast.toasts$ | async) ?? []; track t.id) {
        <div
          class="rounded-xl border border-border bg-card px-4 py-3 shadow-lg"
          [class]="t.type === 'error' ? 'bg-destructive' : 'bg-success'"
        >
          @if (t.title) {
            <div class="text-sm font-semibold text-foreground">{{ t.title }}</div>
          }
          <div class="text-sm" [class]="t.type === 'error' ? 'text-error' : 'text-success'">
            {{ t.message }}
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  toast = inject(ToastService);
}
