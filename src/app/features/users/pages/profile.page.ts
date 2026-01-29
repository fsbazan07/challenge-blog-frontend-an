import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { UsersService } from '../services/users.service';
import { AuthService } from '../../auth/services/auth.service';
import { AuthSessionService } from '../../auth/services/auth-session.service';

import type { UserMe } from '../types/users.types';
import { InputGuardDirective } from '../../../shared/directives/input-guard.directive';
import { ApiError } from '../../../shared/http/types';
import { normalizeApiError } from '../../../shared/http/errors';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ngGuards } from '../../../shared/directives/guards';
import { ConfirmModalComponent } from '../../../shared/ui/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DotsLoaderComponent } from '../../../shared/ui/loader/dots-loader.component';
import { NgIconComponent } from '@ng-icons/core';
//import { ConfirmModalComponent } from '../../../shared/ui/confirm-modal/confirm-modal.component';

// ✅ validators custom
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value ?? '';
  const confirm = group.get('confirmNewPassword')?.value ?? '';
  if (!newPassword || !confirm) return null;
  return newPassword === confirm ? null : { passwordMismatch: true };
}

function newPasswordDifferent(group: AbstractControl): ValidationErrors | null {
  const currentPassword = (group.get('currentPassword')?.value ?? '').trim();
  const newPassword = (group.get('newPassword')?.value ?? '').trim();
  if (!currentPassword || !newPassword) return null;
  return currentPassword === newPassword ? { passwordSameAsCurrent: true } : null;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGuardDirective,
    ConfirmModalComponent,
    ButtonComponent,
    DotsLoaderComponent,
    NgIconComponent,
  ],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  // ✅ Exponer guards al template
  readonly ngGuards = ngGuards;
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private toast = inject(ToastService);

  //pw = ngGuards.password;

  user: UserMe | null = null;

  isLoading = false;
  isSavingName = false;
  isChangingPassword = false;
  isDeactivating = false;

  error: ApiError | null = null;
  successMessage: string | null = null;

  confirmOpen = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  // ✅ forms
  nameForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
  });

  passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatch, newPasswordDifferent] },
  );

  ngOnInit(): void {
    this.fetchMe();
  }

  clearMessage(): void {
    this.error = null;
    this.successMessage = null;
  }

  private hydrate(u: UserMe): void {
    this.user = u;
    this.nameForm.patchValue({ name: u.name ?? '' }, { emitEvent: false });
  }

  fetchMe(): void {
    this.clearMessage();
    this.isLoading = true;

    this.usersService
      .me()
      .then((user) => {
        this.hydrate(user);
        this.isLoading = false;
      })
      .catch((e) => {
        this.error = normalizeApiError(e.message);
        this.toast.error(e.message);
        this.isLoading = false;
      });
  }

  saveName(): void {
    this.clearMessage();
    this.nameForm.markAllAsTouched();
    if (this.nameForm.invalid) {
      this.toast.error('El nombre es requerido');
      return;
    }

    const n = (this.nameForm.value.name ?? '').trim();
    if (!n) {
      this.toast.error('El nombre es requerido');
      return;
    }

    this.isSavingName = true;

    this.usersService
      .updateMe({ name: n })
      .then((user) => {
        this.hydrate(user);
        this.successMessage = 'Nombre actualizado correctamente';
        this.toast.success('Nombre actualizado correctamente');
        this.authSession.setUser(user);
        this.isSavingName = false;
      })
      .catch((e) => {
        this.error = normalizeApiError(e.message);
        this.toast.error(e.message);
        this.isSavingName = false;
      });
  }

  changePassword(): void {
    this.clearMessage();
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    const currentPassword = (this.passwordForm.value.currentPassword ?? '').trim();
    const newPassword = (this.passwordForm.value.newPassword ?? '').trim();

    this.isChangingPassword = true;

    this.usersService
      .changePassword({ currentPassword, newPassword })
      .then(() => {
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });

        this.toast.success('Contraseña actualizada correctamente');
        this.isChangingPassword = false;
      })
      .catch((e) => {
        this.error = normalizeApiError(e.message);
        this.toast.error(e.message);
        this.isChangingPassword = false;
      });
  }

  openConfirm(): void {
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    this.confirmOpen = false;
  }

  deactivateMe(): void {
    this.clearMessage();
    this.isDeactivating = true;

    this.usersService
      .deactivateMe()
      .then(async () => {
        this.authService.logout();
        this.authSession.clear();
        this.router.navigateByUrl('/login');
        this.isDeactivating = false;
        this.confirmOpen = false;
      })
      .catch((e) => {
        this.error = normalizeApiError(e.message);
        this.toast.error(e.message);
        this.isDeactivating = false;
        this.confirmOpen = false;
      });
  }

  toggleShowCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleShowConfirmNewPassword(): void {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  // helpers template
  get nameCtrl() {
    return this.nameForm.controls.name;
  }

  get pw() {
    return this.passwordForm.controls;
  }

  get passwordMismatch(): boolean {
    return !!this.passwordForm.errors?.['passwordMismatch'];
  }

  get passwordsSameAsCurrent(): boolean {
    return !!this.passwordForm.errors?.['passwordSameAsCurrent'];
  }
}
