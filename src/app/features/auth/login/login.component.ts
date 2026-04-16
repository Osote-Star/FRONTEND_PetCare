// features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service';
import { LoginDto } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authModal = inject(AuthModalService);

  isLoading = signal(false);
  error = signal<string | null>(null);

  captchaToken: string = '';
  showCaptcha = signal(false);

  failedAttempts = 0;   

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngAfterViewInit() {

}

private renderCaptcha() {
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha) {
      grecaptcha.render('recaptcha-container', {
        sitekey: '6Lck47ksAAAAAGaS3DvBNgaWZrnJK8ZCwbYXEEYF',
        callback: (token: string) => {
          this.captchaToken = token;
        }
      });
    }
  }


 submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Si ya se mostró el captcha, validarlo
    if (this.showCaptcha() && !this.captchaToken) {
      this.error.set('Por favor completa el captcha');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login({
      ...this.form.value,
      CaptchaToken: this.captchaToken || ''
    } as LoginDto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.failedAttempts++;         
        this.error.set(err.error?.message ?? 'Credenciales incorrectas');
        this.isLoading.set(false);

        // Mostrar captcha a partir del primer fallo
        if (this.failedAttempts >= 1 && !this.showCaptcha()) {
          this.showCaptcha.set(true);
          // Esperar a que el div esté en el DOM antes de renderizar
          setTimeout(() => this.renderCaptcha(), 100);
        } else if (this.showCaptcha()) {
          // Resetear si ya estaba visible
          (window as any).grecaptcha?.reset();
          this.captchaToken = '';
        }
      },
    });
  }


  goRegister(): void {
    this.authModal.openRegister();
  }
}