// pages/clinic/clinic.component.ts
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClinicService } from '../../../../services/Clinic.service';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { Clinic } from '../../../../models/Clinic.model';

@Component({
  selector: 'app-clinic',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule],
  templateUrl: './clinic.component.html',
  styleUrls: ['./clinic.component.scss']
})
export class ClinicComponent implements OnInit {

  private router = inject(Router);
  private clinicService = inject(ClinicService);
  wizardState = inject(WizardStateService);

  clinics: Clinic[] = [];
  selectedClinic: Clinic | null = null;
  loading = true;
  error = '';

  // Mapa (mock)
  mapPins = [
    { id: '1', label: 'Condesa', left: '38%', top: '30%' },
    { id: '2', label: 'Polanco', left: '58%', top: '22%' },
    { id: '3', label: 'Interlomas', left: '20%', top: '55%' },
    { id: '4', label: 'Santa Fe', left: '14%', top: '38%' }
  ];

  ngOnInit() {
    this.loadClinics();
  }

  loadClinics() {
    this.loading = true;

    this.clinicService.getAllClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
        this.loading = false;

        // Restaurar selección
        const saved = this.wizardState.getClinic();
        if (saved && clinics.length > 0) {
          this.selectedClinic = clinics.find(c => c.id_clinic === saved.id_clinic) || null;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar las clínicas';
        this.loading = false;
      }
    });
  }

  trackById(index: number, clinic: Clinic): string {
    return clinic.id_clinic;
  }

  getClinicByPin(pin: any): Clinic | null {
    if (!this.clinics || this.clinics.length === 0 || !pin) {
      return null;
    }
    
    const pinLabel = pin.label.toLowerCase().trim();
    
    return this.clinics.find(c => {
      const location = c.location.toLowerCase();
      return location.includes(pinLabel) || 
             pinLabel.includes(location) ||
             location.replace('la ', '').includes(pinLabel) ||
             pinLabel.includes(location.replace('la ', ''));
    }) || null;
  }

  selectClinicFromPin(pin: any) {
    const clinic = this.getClinicByPin(pin);
    if (clinic) {
      this.selectClinic(clinic);
    }
  }

  selectClinic(clinic: Clinic) {
    if (!clinic) return;
    
    this.selectedClinic = clinic;

    this.wizardState.setClinic({
      id_clinic: clinic.id_clinic,
      name: clinic.name,
      location: clinic.location,
      schedule: clinic.schedule
    });
  }

  isSelected(clinic: Clinic): boolean {
    return this.selectedClinic?.id_clinic === clinic.id_clinic;
  }

  isPinActive(pin: any): boolean {
    if (!this.selectedClinic) return false;

    const location = this.selectedClinic.location.toLowerCase();

    if (pin.label === 'Condesa' && location.includes('condesa')) return true;
    if (pin.label === 'Polanco' && location.includes('polanco')) return true;
    if (pin.label === 'Interlomas' && location.includes('interlomas')) return true;
    if (pin.label === 'Santa Fe' && location.includes('santa fe')) return true;

    return false;
  }

  getMapInfo() {
    if (!this.selectedClinic) return null;

    let shortName = this.selectedClinic.location;

    if (shortName.includes(',')) {
      shortName = shortName.split(',')[0];
    }

    return {
      nombre: shortName,
      location: this.selectedClinic.location,
      schedule: this.selectedClinic.schedule || 'Horario no especificado'
    };
  }

  next() {
    if (!this.selectedClinic) {
      alert('Por favor selecciona una clínica');
      return;
    }

    this.router.navigate(['/citas/servicios']);
  }

  back() {
    this.router.navigate(['/citas']);
  }
}