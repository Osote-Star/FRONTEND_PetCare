// features/appointments/user/pages/datacite/datacite.component.ts
import { Component, inject, OnInit, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { PetService } from '../../../../services/pet.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { Pet, CreatePetDto, UpdatePetDto } from '../../../../models/pet.model';
import { MascotaData } from '../../../../models/wizard.models';
import { firstValueFrom } from 'rxjs';
import { 
  noXssValidator, 
  safeTextValidator, 
  noHtmlValidator, 
  maxLengthSafeValidator, 
  phoneValidator, 
  safeEmailValidator 
} from '../../../../../../core/validators/security.validators';
import { SanitizePipe } from '@core/pipe/sanitize.pipe';

@Component({
  selector: 'app-datacite',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [SanitizePipe, CommonModule, RouterModule, ReactiveFormsModule],
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
  successMessage = signal<string | null>(null);
  fieldFocused = signal<string | null>(null);
  
  tutorForm!: FormGroup;
  mascotaForm!: FormGroup;

  // Opciones para selects
  readonly comoEnterasteOptions = [
    { value: 'google', label: 'Google' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'recomendacion', label: 'Recomendación' },
    { value: 'volante', label: 'Volante / Publicidad' },
    { value: 'otro', label: 'Otro' }
  ];

  readonly recordatorioOptions = [
    { value: 'email', label: '📧 Email' },
    { value: 'whatsapp', label: '📱 WhatsApp' },
    { value: 'sms', label: '💬 SMS' }
  ];

  readonly especieOptions = [
    { value: 'perro', label: '🐕 Perro' },
    { value: 'gato', label: '🐈 Gato' },
    { value: 'ave', label: '🦜 Ave' },
    { value: 'roedor', label: '🐹 Roedor' },
    { value: 'reptil', label: '🦎 Reptil' },
    { value: 'otro', label: '🐾 Otro' }
  ];

  readonly sexoOptions = [
    { value: 'macho', label: '♂️ Macho' },
    { value: 'hembra', label: '♀️ Hembra' }
  ];

  readonly esterilizadoOptions = [
    { value: 'si', label: '✅ Sí' },
    { value: 'no', label: '❌ No' },
    { value: 'desconocido', label: '❓ No sé' }
  ];

  isTutorFormValid = computed(() => this.tutorForm?.valid || false);
  isMascotaFormValid = computed(() => this.mascotaForm?.valid || false);

  constructor() {
    this.initForms();
  }

  private initForms(): void {
    this.tutorForm = this.fb.group({
      email: ['', {
        validators: [Validators.required, safeEmailValidator(), noXssValidator(), maxLengthSafeValidator(254)],
        updateOn: 'blur'
      }],
      nombre: ['', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), safeTextValidator(), noXssValidator(), noHtmlValidator()],
        updateOn: 'blur'
      }],
      apellido: ['', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), safeTextValidator(), noXssValidator(), noHtmlValidator()],
        updateOn: 'blur'
      }],
      telefono: ['', {
        validators: [Validators.required, phoneValidator('mx'), noXssValidator()],
        updateOn: 'blur'
      }],
      comoEnteraste: ['', {
        validators: [noXssValidator(), maxLengthSafeValidator(100)],
        updateOn: 'change'
      }],
      recordatorioVia: ['email', {
        validators: [Validators.required, noXssValidator()],
        updateOn: 'change'
      }],
      notas: ['', {
        validators: [maxLengthSafeValidator(500), noXssValidator(), noHtmlValidator()],
        updateOn: 'blur'
      }]
    });

    this.mascotaForm = this.fb.group({
      nombre: ['', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), safeTextValidator(), noXssValidator(), noHtmlValidator()],
        updateOn: 'blur'
      }],
      edad: ['', {
        validators: [this.ageValidator()],
        updateOn: 'blur'
      }],
      especie: ['perro', {
        validators: [Validators.required, noXssValidator()],
        updateOn: 'change'
      }],
      raza: ['', {
        validators: [Validators.maxLength(50), safeTextValidator(), noXssValidator()],
        updateOn: 'blur'
      }],
      peso: ['', {
        validators: [this.weightValidator()],
        updateOn: 'blur'
      }],
      sexo: ['', {
        validators: [noXssValidator()],
        updateOn: 'change'
      }],
      esterilizado: ['', {
        validators: [noXssValidator()],
        updateOn: 'change'
      }],
      alergias: ['', {
        validators: [maxLengthSafeValidator(200), noXssValidator(), noHtmlValidator()],
        updateOn: 'blur'
      }]
    });
  }

  private ageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const stringValue = String(value).trim();
      
      const numberPattern = /^\d+(\.\d+)?$/;
      const agePattern = /^(\d+(\.\d+)?)\s*(años?|meses?|año|mes)$/i;
      
      if (numberPattern.test(stringValue)) {
        const num = parseFloat(stringValue);
        if (num < 0) return { ageNegative: true };
        if (num > 30) return { ageTooHigh: true };
        return null;
      }
      
      if (agePattern.test(stringValue)) {
        const match = stringValue.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          const num = parseFloat(match[1]);
          if (num < 0) return { ageNegative: true };
          if (num > 30 && !stringValue.includes('mes')) return { ageTooHigh: true };
          if (num > 360 && stringValue.includes('mes')) return { ageTooHigh: true };
          return null;
        }
      }
      
      return { invalidAgeFormat: true };
    };
  }

  private weightValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const num = parseFloat(value);
      if (isNaN(num)) return { invalidWeight: true };
      if (num < 0) return { weightNegative: true };
      if (num > 200) return { weightTooHigh: true };
      if (num > 0 && num < 0.1) return { weightTooLow: true };
      
      return null;
    };
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarMascotasUsuario();
  }

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
// Agrega estos métodos dentro de la clase DataciteComponent

// ==================== MÉTODOS PARA VALIDACIÓN VISUAL ====================

/**
 * Obtiene el estado de un campo (valid/invalid/pending)
 */
getFieldStatus(form: FormGroup, fieldName: string): 'valid' | 'invalid' | 'pending' | null {
  const control = form.get(fieldName);
  if (!control || !control.touched) return null;
  if (control.valid) return 'valid';
  if (control.invalid) return 'invalid';
  return null;
}

/**
 * Obtiene el ícono para el estado del campo
 */
getFieldIcon(form: FormGroup, fieldName: string): string {
  const status = this.getFieldStatus(form, fieldName);
  if (status === 'valid') return '✅';
  if (status === 'invalid') return '❌';
  return '';
}

/**
 * Obtiene todos los errores de un campo como array de strings
 */
getFieldErrors(form: FormGroup, fieldName: string): string[] {
  const control = form.get(fieldName);
  if (!control?.errors || !control.touched) return [];
  
  const errors: string[] = [];
  const errorMap = control.errors;
  
  if (errorMap['required']) errors.push('Este campo es requerido');
  if (errorMap['email']) errors.push('Ingresa un correo electrónico válido');
  if (errorMap['minlength']) errors.push(`Mínimo ${errorMap['minlength'].requiredLength} caracteres`);
  if (errorMap['maxlength']) errors.push(`Máximo ${errorMap['maxlength'].requiredLength} caracteres`);
  if (errorMap['pattern']) {
    if (fieldName === 'telefono') errors.push('Ingresa 10 dígitos numéricos');
    if (fieldName === 'peso') errors.push('Ingresa un número válido (ej: 5.5)');
    if (fieldName === 'edad') errors.push('Ingresa edad en años o meses (ej: 2 o 6 meses)');
  }
  if (errorMap['xssDetected']) errors.push('El texto contiene caracteres no permitidos');
  if (errorMap['invalidCharacters']) errors.push('Solo se permiten letras, números y espacios');
  if (errorMap['htmlDetected']) errors.push('No se permiten etiquetas HTML');
  if (errorMap['invalidAgeFormat']) errors.push('Formato inválido. Ej: "2", "2.5", "6 meses"');
  if (errorMap['ageNegative']) errors.push('La edad no puede ser negativa');
  if (errorMap['ageTooHigh']) errors.push('Edad muy alta. ¿Estás seguro?');
  if (errorMap['invalidWeight']) errors.push('Ingresa un peso válido (ej: 5.5)');
  if (errorMap['weightNegative']) errors.push('El peso no puede ser negativo');
  if (errorMap['weightTooHigh']) errors.push('Peso muy alto. ¿Estás seguro?');
  if (errorMap['weightTooLow']) errors.push('Peso muy bajo. ¿Estás seguro?');
  
  return errors;
}

/**
 * Maneja el focus en un campo
 */
onFieldFocus(fieldName: string): void {
  this.fieldFocused.set(fieldName);
}

/**
 * Maneja el blur de un campo
 */
onFieldBlur(): void {
  this.fieldFocused.set(null);
}
  onPetSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    
    if (value === 'new') {
      this.isNewPet = true;
      this.selectedPetId = null;
      this.mascotaForm.reset({
        nombre: '',
        edad: '',
        especie: 'perro',
        raza: '',
        peso: '',
        sexo: '',
        esterilizado: '',
        alergias: ''
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
          peso: selectedPet.weight.toString(),
          especie: 'perro',
          sexo: '',
          esterilizado: '',
          alergias: ''
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
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  atras(): void {
    this.router.navigate(['/citas/servicioss']);
  }

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

  private async processMascotaData(): Promise<void> {
    this.isSaving.set(true);
    this.error.set(null);
    
    const formData = this.getFormData();
    
    try {
      if (!this.isNewPet && this.selectedPetId) {
        await this.updateExistingPet(formData);
      }
      
      let finalPetId = this.selectedPetId;
      if (this.isNewPet && formData.mascota.nombre) {
        finalPetId = await this.createNewPet(formData);
      }
      
      this.saveToWizardState(formData, finalPetId);
      
      this.isSaving.set(false);
      this.router.navigate(['/citas/confirmacion']);
    } catch {
      this.error.set('Error al guardar los datos. Por favor intenta nuevamente.');
      this.isSaving.set(false);
    }
  }

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

  private saveToWizardState(formData: ReturnType<typeof this.getFormData>, finalPetId: string | null): void {
    const mascotaData: MascotaData = {
      foto: null,
      nombre: formData.mascota.nombre,
      edad: formData.mascota.edad,
      especie: formData.mascota.especie,
      raza: formData.mascota.raza,
      peso: formData.mascota.peso,
      sexo: formData.mascota.sexo,
      esterilizado: formData.mascota.esterilizado,
      alergias: formData.mascota.alergias,
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

  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    if (ageString.includes('mes')) return Math.max(0, value / 12);
    return Math.max(0, value);
  }

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
    if (control.hasError('maxlength')) {
      const required = control.errors['maxlength'].requiredLength;
      return `Máximo ${required} caracteres`;
    }
    if (control.hasError('pattern')) {
      if (field === 'telefono') return 'Ingresa 10 dígitos numéricos';
      if (field === 'peso') return 'Ingresa un número válido (ej: 5.5)';
      if (field === 'edad') return 'Ingresa edad en años o meses (ej: 2 o 6 meses)';
    }
    if (control.hasError('xssDetected')) return 'El texto contiene caracteres no permitidos';
    if (control.hasError('invalidCharacters')) return 'Solo se permiten letras, números y espacios';
    if (control.hasError('htmlDetected')) return 'No se permiten etiquetas HTML';
    if (control.hasError('invalidAgeFormat')) return 'Formato inválido. Ej: "2", "2.5", "6 meses"';
    if (control.hasError('ageNegative')) return 'La edad no puede ser negativa';
    if (control.hasError('ageTooHigh')) return 'Edad muy alta. ¿Estás seguro?';
    if (control.hasError('invalidWeight')) return 'Ingresa un peso válido (ej: 5.5)';
    if (control.hasError('weightNegative')) return 'El peso no puede ser negativo';
    if (control.hasError('weightTooHigh')) return 'Peso muy alto. ¿Estás seguro?';
    if (control.hasError('weightTooLow')) return 'Peso muy bajo. ¿Estás seguro?';
    
    return 'Campo inválido';
  }
}