// features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service';

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
  private readonly authModal = inject(AuthModalService); // 👈 AÑADIR

  isLoading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        // ✅ Cerrar modal y redirigir a la URL guardada
        this.authModal.close();
        this.authModal.runAfterLogin();
      },
      error: (err: any) => {
        this.error.set(err.error?.message ?? 'Credenciales incorrectas');
        this.isLoading.set(false);
      },
    });
  }

  goRegister(): void {
    this.authModal.openRegister();
  }
}