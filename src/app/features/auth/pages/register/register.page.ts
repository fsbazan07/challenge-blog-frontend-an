import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import type { ApiError } from '../../../../shared/http/types';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { isPasswordValid } from '../../../../shared/utils/validation/validators';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputGuardDirective } from '../../../../shared/directives/input-guard.directive';
import { ngGuards } from '../../../../shared/directives/guards';
import { NgIconComponent } from '@ng-icons/core';
import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    InputGuardDirective,
    NgIconComponent,
    DotsLoaderComponent,
  ],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  guards = ngGuards;

  // UI state (igual estilo login)
  showPassword = false;
  showConfirmPassword = false;

  isSubmitting = false;
  error: string | null = null;

  fieldErrors: Record<'name' | 'email' | 'password' | 'confirmPassword', string | null> = {
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  };

  // ---------------------------
  // UI helpers
  // ---------------------------
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearNameErrors() {
    this.fieldErrors.name = null;
    this.error = null;
  }

  clearEmailErrors() {
    this.fieldErrors.email = null;
    this.error = null;
  }

  clearPasswordErrors() {
    this.fieldErrors.password = null;
    this.error = null;
  }

  clearConfirmPasswordErrors() {
    this.fieldErrors.confirmPassword = null;
    this.error = null;
  }

  private clearAllFieldErrors() {
    this.fieldErrors = {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    };
  }

  // ---------------------------
  // Validators
  // ---------------------------
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const v = String(control.value ?? '');
    return isPasswordValid(v) ? null : { passwordInvalid: true };
  }

  private passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  };

  private setClientValidationErrors() {
    const c = this.form.controls;

    if (c.name.errors) {
      if (c.name.errors['required']) this.fieldErrors.name = 'El nombre es requerido.';
      else if (c.name.errors['minlength'])
        this.fieldErrors.name = 'El nombre debe tener al menos 2 caracteres.';
      else if (c.name.errors['maxlength']) this.fieldErrors.name = 'El nombre es demasiado largo.';
    }

    if (c.email.errors) {
      if (c.email.errors['required']) this.fieldErrors.email = 'El email es requerido.';
      else if (c.email.errors['email']) this.fieldErrors.email = 'Ingresá un email válido.';
    }

    if (c.password.errors) {
      if (c.password.errors['required']) this.fieldErrors.password = 'La contraseña es requerida.';
      else if (c.password.errors['passwordInvalid'])
        this.fieldErrors.password = 'La contraseña no es válida.';
    }

    if (c.confirmPassword.errors?.['required']) {
      this.fieldErrors.confirmPassword = 'Confirmá tu contraseña.';
    }

    if (this.form.errors?.['passwordMismatch']) {
      this.fieldErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
  }

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordMatchValidator] },
  );

  // ---------------------------
  // Submit
  // ---------------------------
  async submit() {
    this.error = null;
    this.clearAllFieldErrors();

    if (this.form.invalid) {
      this.setClientValidationErrors();
      this.toast.error('Revisá los campos');
      return;
    }

    this.isSubmitting = true;

    try {
      const { name, email, password } = this.form.getRawValue();

      const res = await firstValueFrom(
        this.auth.register({
          name: String(name).trim(),
          email: String(email).trim(),
          password: String(password),
        }),
      );

      if (res?.accessToken) {
        this.toast.success('Cuenta creada');
        await this.router.navigateByUrl('/feed');
        return;
      }

      this.toast.success('Cuenta creada. Iniciá sesión');
      await this.router.navigateByUrl('/login');
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = Array.isArray(apiErr?.message) ? apiErr.message.join(', ') : apiErr?.message;

      this.toast.error(msg || 'Error inesperado');
      this.error = msg || 'Error inesperado';

      // (opcional) mapping simple hacia campos
      const lower = (msg || '').toLowerCase();
      if (lower.includes('email')) this.fieldErrors.email = this.error;
      if (lower.includes('password') || lower.includes('contraseña'))
        this.fieldErrors.password = this.error;
      if (lower.includes('name') || lower.includes('nombre')) this.fieldErrors.name = this.error;
    } finally {
      this.isSubmitting = false;
    }
  }
}
