import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { WizardStateService } from '../../../../services/wizard-state.service';

export interface TutorData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  comoEnteraste: string;
  recordatorioVia: string;
  notas: string;
}

export interface MascotaData {
  foto: File | null;
  nombre: string;
  edad: string;
  especie: string;
  raza: string;
  peso: string;
  sexo: string;
  esterilizado: string;
  alergias: string;
}

export interface DatosFormData {
  tutor: TutorData;
  mascota: MascotaData;
}

@Component({
  selector: 'app-datacite',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './datacite.component.html',
  styleUrls: ['./datacite.component.scss']
})
export class dataciteComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private wizardState = inject(WizardStateService);

  activeTab: 'tutor' | 'mascota' = 'tutor';
  avatarPreview: string | null = null;
  avatarFile: File | null = null;

  // Opciones para selects
  comoEnterasteOptions = [
    { value: 'google', label: 'Google' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'recomendacion', label: 'Recomendación' },
    { value: 'volante', label: 'Volante / Publicidad' }
  ];

  recordatorioOptions = [
    { value: 'email', label: '📧 Email' },
    { value: 'whatsapp', label: '📱 WhatsApp' },
    { value: 'sms', label: '💬 SMS' }
  ];

  especieOptions = [
    { value: 'perro', label: '🐶 Perro' },
    { value: 'gato', label: '🐱 Gato' },
    { value: 'conejo', label: '🐇 Conejo' },
    { value: 'ave', label: '🐦 Ave' },
    { value: 'otro', label: '🐠 Otro' }
  ];

  sexoOptions = [
    { value: 'macho', label: '♂ Macho' },
    { value: 'hembra', label: '♀ Hembra' },
    { value: 'sin_especificar', label: '— Sin especificar' }
  ];

  esterilizadoOptions = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
    { value: 'desconocido', label: 'No sé' }
  ];

  // Formularios reactivos
  tutorForm: FormGroup;
  mascotaForm: FormGroup;

  constructor() {
    // Inicializar formulario de tutor
    this.tutorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      comoEnteraste: [''],
      recordatorioVia: ['email'],
      notas: ['']
    });

    // Inicializar formulario de mascota
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      edad: [''],
      especie: ['', Validators.required],
      raza: [''],
      peso: [''],
      sexo: ['sin_especificar'],
      esterilizado: [''],
      alergias: ['']
    });
  }

  ngOnInit() {
    this.cargarDatosGuardados();
  }

  cargarDatosGuardados() {
    // Aquí puedes recuperar datos del WizardStateService si los hay
  }

  // ✅ MÉTODOS SEGUROS PARA ACCEDER A LOS CONTROLES
  getTutorControl(controlName: string): FormControl {
    const control = this.tutorForm.get(controlName);
    if (!control) {
      throw new Error(`Control ${controlName} no encontrado en tutorForm`);
    }
    return control as FormControl;
  }

  getMascotaControl(controlName: string): FormControl {
    const control = this.mascotaForm.get(controlName);
    if (!control) {
      throw new Error(`Control ${controlName} no encontrado en mascotaForm`);
    }
    return control as FormControl;
  }

  // Cambiar entre tabs
  setActiveTab(tab: 'tutor' | 'mascota') {
    this.activeTab = tab;
  }

  // Manejar subida de avatar
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede pesar más de 5 MB');
        return;
      }

      this.avatarFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Validar formularios
  validate(): boolean {
    if (this.activeTab === 'tutor') {
      this.markFormGroupTouched(this.tutorForm);
      return this.tutorForm.valid;
    } else {
      this.markFormGroupTouched(this.mascotaForm);
      return this.mascotaForm.valid;
    }
  }

  // Marcar todos los campos como tocados para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Obtener datos completos del formulario
  getFormData(): DatosFormData {
    return {
      tutor: this.tutorForm.value,
      mascota: {
        ...this.mascotaForm.value,
        foto: this.avatarFile
      }
    };
  }

  // Navegación
  atras() {
    this.router.navigate(['/citas/usuario/servicioss']);
  }

  siguiente() {
    // Validar según el tab activo
    if (this.activeTab === 'tutor') {
      if (this.tutorForm.valid) {
        this.setActiveTab('mascota');
      } else {
        this.markFormGroupTouched(this.tutorForm);
      }
    } else {
      if (this.mascotaForm.valid) {
        // Guardar datos en wizard state
        const formData = this.getFormData();
        console.log('✅ Datos guardados:', formData);
        
        // Aquí guardarías en WizardStateService
        // this.wizardState.setDatosTutor(formData.tutor);
        // this.wizardState.setDatosMascota(formData.mascota);
        
        this.router.navigate(['/citas/confirmacion']);
      } else {
        this.markFormGroupTouched(this.mascotaForm);
      }
    }
  }

  // Helper para errores - VERSIÓN MEJORADA
  hasError(form: FormGroup, field: string, error: string = 'required'): boolean {
    const control = form.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }

  // Helper para obtener mensajes de error específicos
  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors || !control.touched) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control.hasError('email')) {
      return 'Correo electrónico inválido';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}