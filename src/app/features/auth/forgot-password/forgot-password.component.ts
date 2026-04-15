import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
email = '';
message = '';

  isLoading = signal(false);
  Enviado = signal(false);
  error = signal<string | null>(null);

constructor(private authService: AuthService) {}


submit() {
  this.message = '';
    this.isLoading.set(true);
    this.error.set(null);
  this.authService.requestPasswordReset(this.email).subscribe({
    next: (res: any) => {
      this.message = res.message;
      this.isLoading.set(false);
      this.Enviado.set(true);
    },
    error: () => {
      this.error.set('Error al enviar la solicitud');
      this.isLoading.set(false);
    }
  });
}
}
