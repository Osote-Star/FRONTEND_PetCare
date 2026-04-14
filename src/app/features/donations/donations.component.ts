// features/donations/donations.component.ts
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonationService } from './services/donation.service';
import { CreateDonationDto, DonationOption } from './models/donation.model';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss'
})
export class DonationsComponent {
  private readonly donationService = inject(DonationService);

  // Montos fijos disponibles
  readonly opcionesMonto: DonationOption[] = [
    { amount: 50,  label: '$50',  description: 'Ayuda a cubrir una consulta básica' },
    { amount: 100, label: '$100', description: 'Cubre vacunas para una mascota' },
    { amount: 200, label: '$200', description: 'Apoya una cirugía menor' },
    { amount: 500, label: '$500', description: 'Financia tratamiento completo' },
  ];

  // Estado del formulario
  montoSeleccionado: number | null = null;
  montoPersonalizado: number | null = null;
  donorName: string = '';
  donorEmail: string = '';
  message: string = '';
  usarMontoPersonalizado: boolean = false;

  // Estado UI
  cargando: boolean = false;
  errorMsg: string = '';

  get montoFinal(): number {
    return this.usarMontoPersonalizado
      ? (this.montoPersonalizado ?? 0)
      : (this.montoSeleccionado ?? 0);
  }

  seleccionarMonto(amount: number): void {
    this.montoSeleccionado = amount;
    this.usarMontoPersonalizado = false;
    this.montoPersonalizado = null;
    this.errorMsg = '';
  }

  activarMontoPersonalizado(): void {
    this.usarMontoPersonalizado = true;
    this.montoSeleccionado = null;
    this.errorMsg = '';
  }

  donar(): void {
    if (this.montoFinal <= 0) {
      this.errorMsg = 'Por favor selecciona o ingresa un monto válido';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    const dto: CreateDonationDto = {
      amount: this.montoFinal,
      donor_name: this.donorName.trim() || 'Anónimo',
      donor_email: this.donorEmail.trim() || undefined,
      message: this.message.trim() || undefined
    };

    this.donationService.createOrder(dto).subscribe({
      next: (donation) => {
        this.cargando = false;
        window.location.href = donation.approval_url;
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.message;
      }
    });
  }
}