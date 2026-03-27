import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-appointment-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './appointment-admin.component.html',
})
export class AppointmentAdminComponent  {

}