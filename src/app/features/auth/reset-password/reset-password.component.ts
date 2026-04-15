import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
token: string = '';
newPassword = '';
confirmPassword = '';
message = '';
  private readonly router = inject(Router);
  
  isLoading = signal(false);
    error = signal<string | null>(null);
  Enviado = signal(false);

constructor(
  private route: ActivatedRoute,
  private authService: AuthService
) {}

ngOnInit() {
  const rawToken = this.route.snapshot.queryParamMap.get('token') || '';
  this.token = decodeURIComponent(rawToken).replace(/ /g, '+');

  console.log("TOKEN FINAL:", this.token);
}

submit() {
  this.message = ''; 
        if (this.newPassword.length < 8) {
        this.message = 'La contraseña debe tener al menos 8 caracteres';
        this.error.set('La contraseña debe tener al menos 8 caracteres');
        return;
      }

  if (this.newPassword !== this.confirmPassword) {
    this.message = 'Las contraseñas no coinciden';
    this.error.set('Las contraseñas no coinciden');
    return;
  }

   this.isLoading.set(true);
    this.error.set(null);

  this.authService.resetPassword(this.token, this.newPassword).subscribe({
    next: (res: any) => {
      this.message = res.message;
      this.isLoading.set(false);
       this.Enviado.set(true);

      setTimeout(() => {
  this.router.navigate(['/login']);
}, 2000);
    },
    error: () => {
      this.message = 'Token inválido o expirado';
      this.isLoading.set(false);
      this.error.set('Error al enviar la solicitud');
    }
  });
}
}
