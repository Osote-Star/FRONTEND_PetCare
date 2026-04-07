// features/appointments/user/pages/datacite/datacite.component.ts
import { Component, inject, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { PetService } from '../../../../services/pet.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { Pet, CreatePetDto, UpdatePetDto } from '../../../../models/pet.model';
import { MascotaData } from '../../../../models/wizard.models';
import { firstValueFrom } from 'rxjs';
import { noXssValidator,  safeTextValidator } from '../../../../../../core/validators/security.validators';
@Component({
  selector: 'app-datacite',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './datacite.component.html',
  styleUrls: ['./datacite.component.scss']
})
export class DataciteComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private wizardState = inject(WizardStateService);
  private petService = inject(PetService);
  private authService = inject(AuthService);

  // ==================== ESTADO ====================
  activeTab: 'tutor' | 'mascota' = 'tutor';
  userPets: Pet[] = [];
  selectedPetId: string | null = null;
  isNewPet = true;
  isLoadingPets = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);

  // Opciones para selects
  readonly comoEnterasteOptions = [
    { value: 'google', label: 'Google' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'recomendacion', label: 'Recomendación' },
    { value: 'volante', label: 'Volante / Publicidad' }
  ];

  readonly recordatorioOptions = [
    { value: 'email', label: '📧 Email' },
    { value: 'whatsapp', label: '📱 WhatsApp' },
    { value: 'sms', label: '💬 SMS' }
  ];

  // ==================== FORMULARIOS ====================
  tutorForm: FormGroup;
  mascotaForm: FormGroup;

    constructor() {
    this.tutorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, noXssValidator()]],
      nombre: ['', [Validators.required, Validators.minLength(2), safeTextValidator(), noXssValidator()]],
      apellido: ['', [Validators.required, Validators.minLength(2), safeTextValidator(), noXssValidator()]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      comoEnteraste: ['', [noXssValidator()]],
      recordatorioVia: ['email', [noXssValidator()]],
      notas: ['', [noXssValidator()]]
    });

    this.mascotaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), safeTextValidator(), noXssValidator()]],
      edad: ['', [Validators.pattern('^[0-9]+(\\.[0-9]+)?(\\s*(años|meses))?$'), noXssValidator()]],
      raza: ['', [safeTextValidator(), noXssValidator()]],
      peso: ['', [Validators.pattern('^[0-9]+(\\.[0-9]+)?$'), noXssValidator()]]
    });
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarMascotasUsuario();
  }

  /**
   * Carga los datos del usuario autenticado
   */
  private cargarDatosUsuario(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const nameParts = currentUser.name?.split(' ') || [];
      this.tutorForm.patchValue({
        email: currentUser.email,
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        telefono: currentUser.phone || ''
      });
    }
  }

  /**
   * Carga las mascotas del usuario
   */
  cargarMascotasUsuario(): void {
    this.isLoadingPets.set(true);
    
    this.petService.getMyPets().subscribe({
      next: (pets) => {
        this.userPets = pets;
        this.isLoadingPets.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tus mascotas');
        this.isLoadingPets.set(false);
      }
    });
  }

  /**
   * Maneja la selección de mascota existente o nueva
   */
  onPetSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    
    if (value === 'new') {
      this.isNewPet = true;
      this.selectedPetId = null;
      this.mascotaForm.reset({
        nombre: '',
        edad: '',
        raza: '',
        peso: ''
      });
      this.mascotaForm.enable();
    } else {
      this.isNewPet = false;
      this.selectedPetId = value;
      const selectedPet = this.userPets.find(p => p.id_pet === value);
      if (selectedPet) {
        this.mascotaForm.patchValue({
          nombre: selectedPet.name,
          edad: selectedPet.age.toString(),
          raza: selectedPet.breed,
          peso: selectedPet.weight.toString()
        });
      }
    }
  }

  getTutorControl(controlName: string): FormControl {
    return this.tutorForm.get(controlName) as FormControl;
  }

  getMascotaControl(controlName: string): FormControl {
    return this.mascotaForm.get(controlName) as FormControl;
  }

  setActiveTab(tab: 'tutor' | 'mascota'): void {
    this.activeTab = tab;
    this.error.set(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsTouched());
  }

  atras(): void {
    this.router.navigate(['/citas/servicioss']);
  }

  /**
   * Valida y avanza al siguiente paso
   */
  async siguiente(): Promise<void> {
    if (this.activeTab === 'tutor') {
      if (this.tutorForm.valid) {
        this.wizardState.setDatosTutor(this.tutorForm.value);
        this.setActiveTab('mascota');
      } else {
        this.markFormGroupTouched(this.tutorForm);
      }
    } else {
      if (this.mascotaForm.valid) {
        await this.processMascotaData();
      } else {
        this.markFormGroupTouched(this.mascotaForm);
      }
    }
  }

  /**
   * Procesa los datos de la mascota (crea o actualiza)
   */
  private async processMascotaData(): Promise<void> {
    this.isSaving.set(true);
    this.error.set(null);
    
    const formData = this.getFormData();
    
    try {
      // Actualizar mascota existente si es necesario
      if (!this.isNewPet && this.selectedPetId) {
        await this.updateExistingPet(formData);
      }
      
      // Crear mascota nueva si aplica
      let finalPetId = this.selectedPetId;
      if (this.isNewPet && formData.mascota.nombre) {
        finalPetId = await this.createNewPet(formData);
      }
      
      // Guardar en wizardState
      this.saveToWizardState(formData, finalPetId);
      
      this.isSaving.set(false);
      this.router.navigate(['/citas/confirmacion']);
    } catch {
      this.error.set('Error al guardar los datos. Por favor intenta nuevamente.');
      this.isSaving.set(false);
    }
  }

  /**
   * Actualiza una mascota existente si hubo cambios
   */
  private async updateExistingPet(formData: ReturnType<typeof this.getFormData>): Promise<void> {
    const originalPet = this.userPets.find(p => p.id_pet === this.selectedPetId);
    if (!originalPet) return;
    
    const hasChanges = 
      originalPet.name !== formData.mascota.nombre ||
      originalPet.breed !== formData.mascota.raza ||
      originalPet.weight !== this.parseFloatSafe(formData.mascota.peso) ||
      originalPet.age !== this.parseAge(formData.mascota.edad);
    
    if (hasChanges) {
      const updateDto: UpdatePetDto = {
        name: formData.mascota.nombre,
        breed: formData.mascota.raza || 'No especificada',
        weight: this.parseFloatSafe(formData.mascota.peso),
        age: this.parseAge(formData.mascota.edad)
      };
      
      await firstValueFrom(this.petService.updatePet(this.selectedPetId!, updateDto));
      
      // Actualizar lista local
      const index = this.userPets.findIndex(p => p.id_pet === this.selectedPetId);
      if (index !== -1) {
        this.userPets[index] = {
          ...this.userPets[index],
          name: updateDto.name,
          breed: updateDto.breed,
          weight: updateDto.weight,
          age: updateDto.age
        };
      }
    }
  }

  /**
   * Crea una nueva mascota
   */
  private async createNewPet(formData: ReturnType<typeof this.getFormData>): Promise<string> {
    const createDto: CreatePetDto = {
      name: formData.mascota.nombre,
      breed: formData.mascota.raza || 'No especificada',
      weight: this.parseFloatSafe(formData.mascota.peso),
      age: this.parseAge(formData.mascota.edad)
    };
    
    const newPet = await firstValueFrom(this.petService.createPet(createDto));
    this.userPets.push(newPet);
    return newPet.id_pet;
  }

  /**
   * Guarda los datos en el wizardState
   */
  private saveToWizardState(formData: ReturnType<typeof this.getFormData>, finalPetId: string | null): void {
    const mascotaData: MascotaData = {
      foto: null,
      nombre: formData.mascota.nombre,
      edad: formData.mascota.edad,
      especie: '',
      raza: formData.mascota.raza,
      peso: formData.mascota.peso,
      sexo: '',
      esterilizado: '',
      alergias: '',
      id_pet: finalPetId || undefined
    };
    
    this.wizardState.setDatosMascota(mascotaData);
    this.wizardState.setDatosTutor(formData.tutor);
    
    if (finalPetId) {
      this.wizardState.setPet(finalPetId, formData.mascota.nombre);
    }
  }

  getFormData() {
    return {
      tutor: this.tutorForm.value,
      mascota: this.mascotaForm.value,
      isNewPet: this.isNewPet,
      selectedPetId: this.selectedPetId
    };
  }

  /**
   * Parsea edad desde string a número
   */
  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    if (ageString.includes('mes')) return Math.max(0, value / 12);
    return Math.max(0, value);
  }

  /**
   * Parsea peso de forma segura
   */
  private parseFloatSafe(value: string): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  hasError(form: FormGroup, field: string, error: string = 'required'): boolean {
    const control = form.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control?.errors || !control.touched) return '';
    
    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('email')) return 'Ingresa un correo electrónico válido';
    if (control.hasError('minlength')) {
      const required = control.errors['minlength'].requiredLength;
      return `Mínimo ${required} caracteres`;
    }
    if (control.hasError('pattern')) {
      if (field === 'telefono') return 'Ingresa 10 dígitos numéricos';
      if (field === 'peso') return 'Ingresa un número válido (ej: 5.5)';
      if (field === 'edad') return 'Ingresa edad en años o meses (ej: 2 o 6 meses)';
    }
    return 'Campo inválido';
  }
}