import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Clinic } from '../auth/models/vet.model';
import { ClinicService } from '../auth/services/clinic.service';


@Component({
  selector: 'app-adm-clinics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-clinics.component.html',
  styleUrl: './adm-clinics.component.scss'
})
export class AdmClinicsComponent {

   //clinica estados
  clinicLoading = signal(false);
  clinicError = signal<string | null>(null);
  clinicSuccess = signal(false);
  isClinicSubmitting = signal(false);

  clinicSuccessUpd = signal(false);
  clinicSuccessDel = signal(false);

  //mosdtrar y ocultar formularios
  clinicReg = signal(true);
  clinicUpd = signal(false);


  clinics = signal<Clinic[]>([]);
confirmDeleteModal = signal(false);
  clinicForm!: FormGroup;

constructor(
    private fb: FormBuilder,
    private clinicService: ClinicService
  ) {
    this.initForms();
  }

private initForms(): void {
    // Formulario veterinario
    // Formulario clínica
    this.clinicForm = this.fb.group({
      clinicId: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      schedule: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadClinics();
    this.clinicReg.set(true);
    this.clinicUpd.set(false);

    this.enableFields();

  this.clinicForm.get('clinicId')?.valueChanges.subscribe((id) => {
    if (id) {
      const clinic = this.clinics().find(c => c.id_clinic === id);
      if (clinic) {
        this.fillForm(clinic);
        this.enableFields();
      }
    } else {
      this.disableFields(); 
    }
  });
  }



private disableFields(): void {
  this.clinicForm.get('name')?.disable();
  this.clinicForm.get('location')?.disable();
  this.clinicForm.get('schedule')?.disable();
}

private enableFields(): void {
  this.clinicForm.get('name')?.enable();
  this.clinicForm.get('location')?.enable();
  this.clinicForm.get('schedule')?.enable();
}



  loadClinics(): void {
    this.clinicLoading.set(true);
    this.clinicError.set(null);

    this.clinicService.getAll().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
        this.clinicLoading.set(false);
      },
      error: () => {
        this.clinicError.set('No pudimos cargar las clínicas. Por favor intenta más tarde.');
        this.clinicLoading.set(false);
      }
    });
  }


get clinicSelected(): boolean {
  return !!this.clinicForm.value.clinicId;
}

fillForm(clinic: Clinic): void {
  this.clinicForm.patchValue({
    name: clinic.name,
    location: clinic.location,
    schedule: clinic.schedule,
  });
}


  submitClinic(): void {
  if (this.clinicForm.invalid) {
    this.clinicForm.markAllAsTouched();
    return;
  }


  //Botones
  if (this.isClinicSubmitting()) return;

  // ← Redirige según el modo activo
  if (this.clinicUpd()) {
    this.updateClinic();
  } else {
    this.createClinic();
  }
}

private createClinic(): void {
  this.isClinicSubmitting.set(true);
  this.clinicLoading.set(true);
  this.clinicError.set(null);

  const { name, location, schedule } = this.clinicForm.value;

  this.clinicService.create({ name, location, schedule }).subscribe({
    next: () => {
      this.clinicSuccess.set(true);
      this.resetClinicForm();
      this.loadClinics();
      this.isClinicSubmitting.set(false);
      this.clinicLoading.set(false);
      setTimeout(() => this.closeClinicSuccess(), 5000);
    },
    error: () => {
      this.clinicError.set('No pudimos registrar la clínica. Por favor intenta más tarde.');
      this.isClinicSubmitting.set(false);
      this.clinicLoading.set(false);
    }
  });
}


  private resetClinicForm(): void {
    this.clinicForm.reset({
      name: '',
      location: '',
      schedule: ''
    });

    this.clinicForm.markAsPristine();
    this.clinicForm.markAsUntouched();
  }

  closeClinicSuccess(): void {
    this.clinicSuccess.set(false);
    this.clinicSuccessUpd.set(false);
    this.clinicSuccessDel.set(false);
  }

 get clinicNameInvalid(): boolean {
    const control = this.clinicForm.get('name');
    return !!control?.invalid && control.touched;
  }

  get clinicLocationInvalid(): boolean {
    const control = this.clinicForm.get('location');
    return !!control?.invalid && control.touched;
  }

  get clinicScheduleInvalid(): boolean {
    const control = this.clinicForm.get('schedule');
    return !!control?.invalid && control.touched;
  }

//Actualizar clinica
  private updateClinic(): void {
  const { clinicId, name, location, schedule } = this.clinicForm.getRawValue(); 

  if (!clinicId) {
    this.clinicError.set('Selecciona una clínica para actualizar.');
    return;
  }

  this.isClinicSubmitting.set(true);
  this.clinicLoading.set(true);
  this.clinicError.set(null);

  this.clinicService.update(clinicId, { name, location, schedule }).subscribe({
    next: () => {
      this.clinicSuccessUpd.set(true);
      this.resetClinicForm();
      this.loadClinics();
      this.isClinicSubmitting.set(false);
      this.clinicLoading.set(false);
      setTimeout(() => this.closeClinicSuccess(), 5000);
    },
    error: () => {
      this.clinicError.set('No pudimos actualizar la clínica. Por favor intenta más tarde.');
      this.isClinicSubmitting.set(false);
      this.clinicLoading.set(false);
    }
  });
}

//Eliminar clinica
DeleteClincia(){
if (this.isClinicSubmitting()) return;
  this.confirmDeleteModal.set(true);
}

confirmDelete() {
    const clinicId = this.clinicForm.value.clinicId

    this.clinicService.delete(clinicId).subscribe({
      next: () => {
        this.clinicSuccessDel.set(true);
        this.resetClinicForm();
         this.loadClinics();
         setTimeout(() => this.closeClinicSuccess(), 3000);
        this.confirmDeleteModal.set(false);
      },
      error: () => {
        this.clinicError.set('Error al eliminar usuario');
        this.confirmDeleteModal.set(false);
      }
    });
  }

  cancelDelete() {
    this.confirmDeleteModal.set(false);
  }


//Controlar modales
changeToUpdate()
{
  this.clinicReg = signal(false);
  this.clinicUpd = signal(true);
  this.resetClinicForm();
  this.disableFields();
}

changeToRegis()
{
  this.clinicReg = signal(true);
  this.clinicUpd = signal(false);
  this.resetClinicForm();
  this.enableFields();
}

}
