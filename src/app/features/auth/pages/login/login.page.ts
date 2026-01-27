import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from "../../../../shared/ui/button/button.component"; // ajustá si cambia la ruta

type FieldErrors = {
  email: string | null;
  password: string | null;
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIconComponent, ButtonComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  showPassword = false;
  remember = false;

  isSubmitting = false;
  error: string | null = null;

  fieldErrors: FieldErrors = {
    email: null,
    password: null,
  };

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    ],
  });

  // Limpieza de errores “en vivo” (equivalente al hook)
  clearEmailErrors() {
    if (this.fieldErrors.email) this.fieldErrors.email = null;
    if (this.error) this.error = null;
  }

  clearPasswordErrors() {
    if (this.fieldErrors.password) this.fieldErrors.password = null;
    if (this.error) this.error = null;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRemember() {
    this.remember = !this.remember;
  }

  private validate(): boolean {
    this.fieldErrors = { email: null, password: null };

    const email = this.form.controls.email.value.trim();
    const password = this.form.controls.password.value;

    let ok = true;

    if (!email) {
      this.fieldErrors.email = 'El email es requerido.';
      ok = false;
    } else if (this.form.controls.email.hasError('email')) {
      this.fieldErrors.email = 'Ingresá un email válido.';
      ok = false;
    }

    if (!password.trim()) {
      this.fieldErrors.password = 'La contraseña es requerida.';
      ok = false;
    } else if (password.length < 8) {
      this.fieldErrors.password = 'Debe tener al menos 8 caracteres.';
      ok = false;
    } else if (password.length > 72) {
      this.fieldErrors.password = 'La contraseña es demasiado larga.';
      ok = false;
    }

    return ok;
  }

  async submit() {
    if (this.isSubmitting) return;

    this.error = null;
    this.isSubmitting = true;

    const ok = this.validate();
    if (!ok) {
      this.isSubmitting = false;
      return;
    }

    try {
      const email = this.form.controls.email.value.trim();
      const password = this.form.controls.password.value;

      await this.auth.login({ email, password, remember: this.remember });

      await this.router.navigateByUrl('/feed');
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : null) ||
        'Error inesperado';

      this.error = msg;
    } finally {
      this.isSubmitting = false;
    }
  }
}
