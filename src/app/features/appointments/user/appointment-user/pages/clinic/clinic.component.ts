// features/appointments/user/appointment-user/pages/clinic/clinic.component.ts
import { Component, inject, OnInit, ViewEncapsulation, signal } from '@angular/core';
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
  private wizardState = inject(WizardStateService);

  // ==================== ESTADO ====================
  clinics: Clinic[] = [];
  selectedClinic: Clinic | null = null;
  loading = signal(true);
  error = signal<string | null>(null);
  isNavigating = signal(false);

  // ✅ MAPA PINS - HACER PÚBLICO
  readonly mapPins = [
    { id: '1', label: 'Condesa', left: '38%', top: '30%' },
    { id: '2', label: 'Polanco', left: '58%', top: '22%' },
    { id: '3', label: 'Interlomas', left: '20%', top: '55%' },
    { id: '4', label: 'Santa Fe', left: '14%', top: '38%' }
  ];

  ngOnInit(): void {
    this.loadClinics();
  }

  /**
   * Carga todas las clínicas desde el backend
   */
  loadClinics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clinicService.getAllClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
        this.loading.set(false);
        this.restoreSelectedClinic();
      },
      error: () => {
        this.error.set('No pudimos cargar las clínicas. Por favor intenta más tarde.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Restaura la clínica seleccionada previamente
   */
  private restoreSelectedClinic(): void {
    const saved = this.wizardState.getClinic();
    if (saved?.id_clinic && this.clinics.length > 0) {
      const found = this.clinics.find(c => c.id_clinic === saved.id_clinic);
      if (found) {
        this.selectedClinic = found;
      }
    }
  }

  /**
   * Encuentra una clínica por su ubicación
   */
  getClinicByPin(pin: { label: string }): Clinic | null {
    if (!this.clinics.length || !pin?.label) return null;
    
    const pinLabel = pin.label.toLowerCase().trim();
    
    return this.clinics.find(c => {
      const location = c.location.toLowerCase();
      return location.includes(pinLabel) || 
             pinLabel.includes(location) ||
             location.replace('la ', '').includes(pinLabel) ||
             pinLabel.includes(location.replace('la ', ''));
    }) || null;
  }

  /**
   * Selecciona una clínica desde un pin del mapa
   */
  selectClinicFromPin(pin: { label: string }): void {
    const clinic = this.getClinicByPin(pin);
    if (clinic) {
      this.selectClinic(clinic);
    }
  }

  /**
   * Selecciona una clínica y la guarda en el wizard
   */
  selectClinic(clinic: Clinic): void {
    if (!clinic?.id_clinic) return;
    
    this.selectedClinic = clinic;

    const clinicData = {
      id_clinic: clinic.id_clinic,
      name: clinic.name,
      location: clinic.location,
      schedule: clinic.schedule
    };
    
    this.wizardState.setClinic(clinicData);
  }

  /**
   * Verifica si una clínica está seleccionada
   */
  isSelected(clinic: Clinic): boolean {
    return this.selectedClinic?.id_clinic === clinic?.id_clinic;
  }

  /**
   * Verifica si un pin corresponde a la clínica seleccionada
   */
  isPinActive(pin: { label: string }): boolean {
    if (!this.selectedClinic) return false;
    const location = this.selectedClinic.location.toLowerCase();

    switch (pin.label) {
      case 'Condesa': return location.includes('condesa');
      case 'Polanco': return location.includes('polanco');
      case 'Interlomas': return location.includes('interlomas');
      case 'Santa Fe': return location.includes('santa fe');
      default: return false;
    }
  }

  /**
   * Obtiene información de la clínica seleccionada
   */
  getMapInfo(): { nombre: string; location: string; schedule: string } | null {
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

  /**
   * Navega al siguiente paso
   */
  next(): void {
    if (!this.selectedClinic) {
      this.error.set('Por favor selecciona una clínica para continuar');
      return;
    }

    if (this.isNavigating()) return;
    
    this.isNavigating.set(true);
    
    const saved = this.wizardState.getClinic();
    if (!saved?.id_clinic) {
      this.selectClinic(this.selectedClinic);
    }
    
    this.router.navigate(['/citas/servicioss']).finally(() => {
      this.isNavigating.set(false);
    });
  }

  /**
   * Navega al paso anterior
   */
  back(): void {
    this.router.navigate(['/citas']);
  }

  /**
   * TrackBy para optimizar la lista
   */
  trackById(_index: number, clinic: Clinic): string {
    return clinic.id_clinic;
  }
}