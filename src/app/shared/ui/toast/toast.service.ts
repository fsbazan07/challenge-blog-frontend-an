import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timeoutMs?: number;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts.asObservable();

  show(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    const next = [...this._toasts.value, { id, timeoutMs: 3500, ...toast }];
    this._toasts.next(next);

    const t = toast.timeoutMs ?? 3500;
    window.setTimeout(() => this.dismiss(id), t);
  }

  success(message: string, title?: string) {
    this.show({ type: 'success', message, title });
  }
  error(message: string, title?: string) {
    this.show({ type: 'error', message, title });
  }
  info(message: string, title?: string) {
    this.show({ type: 'info', message, title });
  }

  dismiss(id: string) {
    this._toasts.next(this._toasts.value.filter((t) => t.id !== id));
  }
}
