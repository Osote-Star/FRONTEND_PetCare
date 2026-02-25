import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-user.component.html',
})
export class AppointmentUserComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly fb                 = inject(FormBuilder);

  isLoading = signal(false);
  success   = signal(false);
  error     = signal<string | null>(null);

  form = this.fb.group({
    // Datos del dueño (siempre requeridos — no hay cuentas de usuario)
    ownerName:  ['', Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhone: ['', Validators.required],
    // Datos de la mascota y cita
    petName:    ['', Validators.required],
    petType:    ['', Validators.required],
    type:       ['consultation', Validators.required],
    date:       ['', Validators.required],
    time:       ['', Validators.required],
    notes:      [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.appointmentService.createAppointment(this.form.value as any).subscribe({
      next: () => {
        this.success.set(true);
        this.isLoading.set(false);
        this.form.reset();
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al agendar la cita');
        this.isLoading.set(false);
      },
    });
  }
}