// features/appointments/user/appointment-user/appointment-user.component.ts
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthModalService } from '../../../auth/services/auth-modal.service';

@Component({
  selector: 'app-appointment-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./appointment-user.component.scss'],
  templateUrl: './appointment-user.component.html',
})
export class AppointmentUserComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authModal = inject(AuthModalService);

  irAgendarCita(): void {
    if (this.authService.isLoggedIn()) {
      // Está logueado, puede agendar
      this.router.navigate(['/citas/ubicacion']);
    } else {
      // No está logueado, abrir modal
      this.authModal.openLogin('/citas/ubicacion');
    }
  }
}