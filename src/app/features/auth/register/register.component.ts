import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email:    ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
    );
  }


 id_role: number = 1;



  submit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.error.set('');

    const { fullName, email, password } = this.form.value;

    this.authService.register({ name: fullName, email, password, id_role: this.id_role }).subscribe({
      next: () => {
        // Login automático 
        this.authService.login({ email, password }).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => {
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
}