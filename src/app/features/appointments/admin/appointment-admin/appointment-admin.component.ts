import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-appointment-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './appointment-admin.component.html',
})
export class AppointmentAdminComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);

  appointments = signal<Appointment[]>([]);
  isLoading    = signal(false);
  filter       = signal<string>('all');

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => { this.appointments.set(data); this.isLoading.set(false); },
    });
  }

  updateStatus(id: string, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => this.loadAll(),
    });
  }

  assignVet(id: string, vet: string): void {
    this.appointmentService.assignVeterinarian(id, vet).subscribe({
      next: () => this.loadAll(),
    });
  }

  delete(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => this.loadAll(),
    });
  }

  get filteredAppointments() {
    if (this.filter() === 'all') return this.appointments();
    return this.appointments().filter(a => a.status === this.filter());
  }
}