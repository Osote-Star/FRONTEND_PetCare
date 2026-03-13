import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly fb          = inject(FormBuilder);

  isLoading = signal(false);
  error     = signal<string | null>(null);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

 submit(): void {
  if (this.form.invalid) return;

  const { email, password } = this.form.value;

  this.isLoading.set(true);   
  this.error.set(null);        

  this.authService.login({
    email: email!,
    password: password!
  }).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.router.navigate(['/citas']);
    },
    error: (err) => {
      this.error.set(err.error?.message ?? 'Credenciales incorrectas');
      this.isLoading.set(false);
    },
  });
}
}