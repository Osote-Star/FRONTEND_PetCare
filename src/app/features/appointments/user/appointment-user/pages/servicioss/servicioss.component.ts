import { Component, inject, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Servicios
import { WizardStateService } from '../../../../services/wizard-state.service';

// Modelos
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  hasSuboptions?: boolean;
}

export interface MedicalVisit {
  reason: string;
  notes: string;
}

@Component({
  selector: 'app-servicioss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './servicioss.component.html',
  styleUrls: ['./servicioss.component.scss']
})
export class ServiciossComponent implements OnInit {
  private router = inject(Router);
  private wizardState = inject(WizardStateService);

  // Lista de servicios disponibles
  services: Service[] = [
    {
      id: 'bath',
      name: 'Baño',
      description: 'Baño completo con secado y perfume',
      price: 200,
      icon: '🛁',
      hasSuboptions: false
    },
    {
      id: 'bath-haircut',
      name: 'Baño y Corte de pelo',
      description: 'Estética completa para tu mascota',
      price: 350,
      icon: '✂️',
      hasSuboptions: false
    },
    {
      id: 'medical',
      name: 'Visita médica',
      description: 'Consulta con médico veterinario',
      price: 450,
      icon: '🩺',
      hasSuboptions: true
    }
  ];

  // Razones para visita médica
  medicalReasons: string[] = [
    'Vómito', 'Diarrea', 'Sangrado', 'Herida', 
    'Cirugía', 'Vacuna', 'Revisión'
  ];

  // Variables de estado
  selectedService: Service | null = null;
  selectedReason: string = '';
  visitNotes: string = '';
  isMedicalSelected: boolean = false;

  ngOnInit() {
    // Restaurar selección previa si existe
    const savedServices = this.wizardState.getServices();
    if (savedServices && savedServices.length > 0) {
      const saved = savedServices[0]; // Por ahora solo manejamos un servicio
      const service = this.services.find(s => s.id === saved.id);
      if (service) {
        this.selectService(service);
        
        if (service.id === 'medical' && saved.reason) {
          this.selectedReason = saved.reason;
          this.visitNotes = saved.notes || '';
        }
      }
    }
  }

  selectService(service: Service) {
    console.log('Servicio seleccionado:', service);
    this.selectedService = service;
    this.isMedicalSelected = service.id === 'medical';
    
    // Si no es médico, resetear campos
    if (!this.isMedicalSelected) {
      this.selectedReason = '';
      this.visitNotes = '';
    }
  }

  toggleReason(reason: string) {
    if (this.selectedReason === reason) {
      this.selectedReason = ''; // Deseleccionar si ya estaba seleccionado
    } else {
      this.selectedReason = reason; // Seleccionar nuevo
    }
    console.log('Razón seleccionada:', this.selectedReason);
  }

  isReasonActive(reason: string): boolean {
    return this.selectedReason === reason;
  }

  isServiceSelected(service: Service): boolean {
    return this.selectedService?.id === service.id;
  }

  validateSelection(): boolean {
    if (!this.selectedService) {
      alert('Por favor selecciona un servicio');
      return false;
    }

    if (this.selectedService.id === 'medical') {
      if (!this.selectedReason) {
        alert('Por favor selecciona una razón para la visita');
        return false;
      }
    }

    return true;
  }

  saveToWizardState() {
    if (!this.selectedService) return;

    const serviceData = {
      id: this.selectedService.id,
      name: this.selectedService.name,
      price: this.selectedService.price,
      reason: this.selectedReason,
      notes: this.visitNotes
    };

    // Guardar en wizardState (como array para futura expansión)
    this.wizardState.setServices([serviceData]);
    console.log('Servicio guardado en wizardState:', serviceData);
  }

  atras() {
    this.router.navigate(['/citas/ubicacion']);
  }

  siguiente() {
    if (this.validateSelection()) {
      this.saveToWizardState();
      this.router.navigate(['/citas/datacites']);
    }
  }
}