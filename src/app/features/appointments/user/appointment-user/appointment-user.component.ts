import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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

  irAgendarCita(): void {
    this.router.navigate(['/citas/ubicacion']);
  }
}