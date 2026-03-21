// features/appointments/user/pages/datacite/datacite.component.ts
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { PetService } from '../../../../services/pet.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { Pet, CreatePetDto, UpdatePetDto } from '../../../../models/pet.model';
import { MascotaData } from '../../../../models/wizard.models';
import { firstValueFrom } from 'rxjs';

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
  public wizardState = inject(WizardStateService);
  private petService = inject(PetService);
  private authService = inject(AuthService);

  activeTab: 'tutor' | 'mascota' = 'tutor';
  
  userPets: Pet[] = [];
  selectedPetId: string | null = null;
  isNewPet: boolean = true;
  isLoadingPets = false;
  isSaving = false;

  // Opciones para selects (solo UI)
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

  // ✅ SOLO CAMPOS DE LA API
  tutorForm: FormGroup;
  mascotaForm: FormGroup;

  constructor() {
    this.tutorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      comoEnteraste: [''],
      recordatorioVia: ['email'],
      notas: ['']
    });

    // ✅ SOLO CAMPOS QUE ENVÍA LA API
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      edad: [''],
      raza: [''],
      peso: ['']
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarMascotasUsuario();
  }

  cargarDatosUsuario() {
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.tutorForm.patchValue({
        email: currentUser.email,
        nombre: currentUser.name?.split(' ')[0] || '',
        apellido: currentUser.name?.split(' ')[1] || '',
        telefono: currentUser.phone || ''
      });
    }
  }

  cargarMascotasUsuario() {
    this.isLoadingPets = true;
    this.petService.getMyPets().subscribe({
      next: (pets) => {
        this.userPets = pets;
        this.isLoadingPets = false;
      },
      error: (err) => {
        console.error('Error cargando mascotas:', err);
        this.isLoadingPets = false;
      }
    });
  }

  onPetSelect(event: Event) {
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
        this.mascotaForm.enable();
      }
    }
  }

  getTutorControl(controlName: string): FormControl {
    const control = this.tutorForm.get(controlName);
    if (!control) throw new Error(`Control ${controlName} no encontrado`);
    return control as FormControl;
  }

  getMascotaControl(controlName: string): FormControl {
    const control = this.mascotaForm.get(controlName);
    if (!control) throw new Error(`Control ${controlName} no encontrado`);
    return control as FormControl;
  }

  setActiveTab(tab: 'tutor' | 'mascota') {
    this.activeTab = tab;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => control.markAsTouched());
  }

  getFormData() {
    return {
      tutor: this.tutorForm.value,
      mascota: this.mascotaForm.value,
      isNewPet: this.isNewPet,
      selectedPetId: this.selectedPetId
    };
  }

  atras() {
    this.router.navigate(['/citas/servicioss']);
  }

  async siguiente() {
    if (this.activeTab === 'tutor') {
      if (this.tutorForm.valid) {
        this.wizardState.setDatosTutor(this.tutorForm.value);
        this.setActiveTab('mascota');
      } else {
        this.markFormGroupTouched(this.tutorForm);
      }
    } else {
      if (this.mascotaForm.valid) {
        this.isSaving = true;
        const formData = this.getFormData();
        
        if (!this.isNewPet && this.selectedPetId) {
          const originalPet = this.userPets.find(p => p.id_pet === this.selectedPetId);
          const hasChanges = 
            originalPet?.name !== formData.mascota.nombre ||
            originalPet?.breed !== formData.mascota.raza ||
            originalPet?.weight !== parseFloat(formData.mascota.peso) ||
            originalPet?.age !== this.parseAge(formData.mascota.edad);
          
          if (hasChanges) {
            const updateDto: UpdatePetDto = {
              name: formData.mascota.nombre,
              breed: formData.mascota.raza || 'No especificada',
              weight: parseFloat(formData.mascota.peso) || 0,
              age: this.parseAge(formData.mascota.edad)
            };
            try {
              await firstValueFrom(this.petService.updatePet(this.selectedPetId, updateDto));
              const updatedPet: Pet = {
                id_pet: this.selectedPetId!,
                name: updateDto.name,
                breed: updateDto.breed,
                weight: updateDto.weight,
                age: updateDto.age,
                user_name: originalPet?.user_name || '',
                id_user: originalPet?.id_user || ''
              };
              const index = this.userPets.findIndex(p => p.id_pet === this.selectedPetId);
              if (index !== -1) {
                this.userPets[index] = updatedPet;
              }
            } catch (err) {
              console.error('Error actualizando mascota:', err);
            }
          }
        }
        
        // Guardar en wizardState
        const mascotaData: MascotaData = {
          foto: null,
          nombre: formData.mascota.nombre,
          edad: formData.mascota.edad,
          especie: '',  // No se envía a API
          raza: formData.mascota.raza,
          peso: formData.mascota.peso,
          sexo: '',     // No se envía a API
          esterilizado: '',
          alergias: '',
          id_pet: this.isNewPet ? undefined : this.selectedPetId!
        };
        
        this.wizardState.setDatosMascota(mascotaData);
        this.wizardState.setDatosTutor(formData.tutor);
        this.isSaving = false;
        this.router.navigate(['/citas/confirmacion']);
      } else {
        this.markFormGroupTouched(this.mascotaForm);
      }
    }
  }

  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    if (ageString.includes('mes')) return value / 12;
    return value;
  }

  hasError(form: FormGroup, field: string, error: string = 'required'): boolean {
    const control = form.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors || !control.touched) return '';
    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('email')) return 'Correo electrónico inválido';
    if (control.hasError('minlength')) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}