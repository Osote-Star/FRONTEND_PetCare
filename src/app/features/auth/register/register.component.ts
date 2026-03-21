// features/auth/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private authModal = inject(AuthModalService); // 👈 AÑADIR

  isLoading = signal(false);
  error = signal('');

  form: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
      ]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const { fullName, email, phone, password } = this.form.value;

    this.authService.register({ name: fullName, email, phone, password, id_role: 3 }).subscribe({
      next: () => {
        // Login automático después del registro
        this.authService.login({ email, password }).subscribe({
          next: () => {
            this.isLoading.set(false);
            // ✅ Cerrar modal y redirigir
            this.authModal.close();
            this.authModal.runAfterLogin();
          },
          error: () => {
            this.isLoading.set(false);
            this.authModal.close();
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al crear la cuenta');
        this.isLoading.set(false);
      },
    });
  }

  goLogin(): void {
    this.authModal.openLogin();
  }
}