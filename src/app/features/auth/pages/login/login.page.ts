import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

import { normalizeApiError } from '../../../../shared/http/errors';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { InputGuardDirective } from '../../../../shared/directives/input-guard.directive';
import { ngGuards } from '../../../../shared/directives/guards';
import { DotsLoaderComponent } from '../../../../shared/ui/loader/dots-loader.component';
import { AuthSessionService } from '../../services/auth-session.service';

type FieldErrors = {
  email: string | null;
  password: string | null;
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIconComponent,
    ButtonComponent,
    InputGuardDirective,
    DotsLoaderComponent,
  ],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private authSession = inject(AuthSessionService);

  guards = ngGuards;

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
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  clearEmailErrors() {
    if (this.fieldErrors.email) this.fieldErrors.email = null;
    if (this.error) this.error = null;
    this.isSubmitting = false;
  }

  clearPasswordErrors() {
    if (this.fieldErrors.password) this.fieldErrors.password = null;
    if (this.error) this.error = null;
    this.isSubmitting = false;
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

    const ok = this.validate();
    if (!ok) {
      this.toast.error('Revisá los campos del formulario');
      return;
    }

    this.isSubmitting = true;

    const email = this.form.controls.email.value.trim();
    const password = this.form.controls.password.value;

    try {
      // login() ya guarda tokens en AuthService (tap)
      await firstValueFrom(this.auth.login({ email, password }));

      // me() devuelve { user } y el AuthService también setea user en session (tap)
      const meRes = await firstValueFrom(this.auth.me());

      // opcional, pero ok para asegurar
      this.authSession.setUser(meRes.user);

      this.toast.success('Sesión iniciada');
      await this.router.navigateByUrl('/feed');
    } catch (e: unknown) {
      const err = normalizeApiError(e);
      this.error = err.message;
      this.toast.error(err.message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
