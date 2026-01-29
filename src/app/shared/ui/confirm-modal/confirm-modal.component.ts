// src/app/shared/ui/confirm-modal/confirm-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { DotsLoaderComponent } from '../loader/dots-loader.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DotsLoaderComponent],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input({ required: true }) open!: boolean;

  @Input() title = 'Confirmar acción';
  @Input({ required: true }) message!: string;

  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Input() isLoading = false;

  // React: onConfirm / onCancel
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onCancelClick(): void {
    if (this.isLoading) return;
    this.cancelled.emit();
  }

  onConfirmClick(): void {
    if (this.isLoading) return;
    this.confirmed.emit();
  }
}
