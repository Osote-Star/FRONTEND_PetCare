import { Component, signal, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Clinic } from '../auth/models/vet.model';
import { ClinicService } from '../auth/services/clinic.service';


@Component({
  selector: 'app-register-vet',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-vet.component.html',
  styleUrl: './register-vet.component.scss'
})
export class RegisterVetComponent implements OnInit {
  private readonly VET_ROLE = 2;
  private readonly ADM_ROLE = 1;
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly PHONE_PATTERN = /^[0-9]{10}$/;

  // ==================== ESTADO VETERINARIO ====================
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isSubmitting = signal(false);

  //Administradores
    isLoadingAdm = signal(false);
    isSubmittingAdm = signal(false);
    successAdm = signal(false);
  errorAdm = signal<string | null>(null);


  AgrVet = signal(true);
  AgrAdm = signal(false);


    clinicLoading = signal(false);
  clinicError = signal<string | null>(null);

  form!: FormGroup; 
  formAdm!: FormGroup; 

  hours: string[] = [];
  clinics = signal<Clinic[]>([]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService,
    private router: Router
  ) {
    this.initForms();
  }

  private initForms(): void {
    this.form = this.fb.group({
      nombreVet: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      numero: ['', [Validators.required, Validators.pattern(this.PHONE_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
      clinicId: [null, [Validators.required]],
      startHour: [null, [Validators.required]],
      endHour: [null, [Validators.required]]
    });
 this.formAdm = this.fb.group({
      nombreAdm: ['', [Validators.required, Validators.minLength(3)]],
      correoAdm: ['', [Validators.required, Validators.email]],
      numeroAdm: ['', [Validators.required, Validators.pattern(this.PHONE_PATTERN)]],
      passwordAdm: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]]

});
  }

  generateHours(): void {
    this.hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      this.hours.push(hour);
    }
  }

  ngOnInit(): void {
    this.loadClinics();
    this.generateHours();
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

  private isValidSchedule(startHour: string, endHour: string): boolean {
    if (!startHour || !endHour) return false;
    return startHour < endHour;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.isLoading.set(true);
    this.error.set(null);

    const { nombreVet, correo, numero, password, clinicId, startHour, endHour } = this.form.value;

    if (!this.isValidSchedule(startHour, endHour)) {
      this.error.set('La hora de inicio debe ser menor a la hora final');
      this.isLoading.set(false);
      this.isSubmitting.set(false);
      return;
    }

    const schedule = `${startHour} - ${endHour}`;

    this.authService.registerVet({
      name: nombreVet,
      email: correo,
      phone: numero,
      password: password,
      id_role: this.VET_ROLE,
      id_clinic: clinicId,
      schedule
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.resetVetForm();
        this.isSubmitting.set(false);

        setTimeout(() => {
          this.closeSuccess();
        }, 3000);
      },
      error: () => {
        this.error.set('No pudimos registrar al veterinario. Por favor intenta más tarde.');
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      }
    });
  }

//ADministradores
submitAdm(){
if (this.formAdm.invalid) {
      this.formAdm.markAllAsTouched();
      return;
    }

    if (this.isSubmittingAdm()) return;

    this.isSubmittingAdm.set(true);
    this.isLoadingAdm.set(true);
    this.errorAdm.set(null);

    const { nombreAdm, correoAdm, numeroAdm, passwordAdm} = this.formAdm.value;

this.authService.register({ name: nombreAdm, email: correoAdm, phone: numeroAdm, password: passwordAdm, id_role: 1 }).subscribe({
      next: () => {
 this.isLoadingAdm.set(false);
        this.successAdm.set(true);
        this.resetAdmForm();
        this.isSubmittingAdm.set(false);

        setTimeout(() => {
          this.closeSuccessAdm();
        }, 3000);
      },
      error: () => {
        this.errorAdm.set('No pudimos registrar al administrador. Por favor intenta más tarde.');
        this.isLoadingAdm.set(false);
        this.isSubmittingAdm.set(false);
      }
    });
}


  private resetVetForm(): void {
    this.form.reset({
      nombreVet: '',
      correo: '',
      numero: '',
      password: '',
      clinicId: null,
      startHour: null,
      endHour: null
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

 private resetAdmForm(): void {
    this.formAdm.reset({
      nombreAdm: '',
      correoAdm: '',
      numeroAdm: '',
      passwordAdm: ''
    });

    this.formAdm.markAsPristine();
    this.formAdm.markAsUntouched();
  }



  closeSuccess(): void {
    this.success.set(false);
  }

  closeSuccessAdm(): void {
    this.successAdm.set(false);
  }




//Controlar modales
changeToResAdm()
{
  this.AgrVet = signal(false);
  this.AgrAdm = signal(true);
}

changeToResVet()
{
  this.AgrVet = signal(true);
  this.AgrAdm = signal(false);
}



  get nombreVetInvalid(): boolean {
    const control = this.form.get('nombreVet');
    return !!control?.invalid && control.touched;
  }
  
  get correoInvalid(): boolean {
    const control = this.form.get('correo');
    return !!control?.invalid && control.touched;
  }

  get numeroInvalid(): boolean {
    const control = this.form.get('numero');
    return !!control?.invalid && control.touched;
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control?.invalid && control.touched;
  }

  get clinicIdInvalid(): boolean {
    const control = this.form.get('clinicId');
    return !!control?.invalid && control.touched;
  }

  get startHourInvalid(): boolean {
    const control = this.form.get('startHour');
    return !!control?.invalid && control.touched;
  }

  get endHourInvalid(): boolean {
    const control = this.form.get('endHour');
    return !!control?.invalid && control.touched;
  }

//Administradores

  get nombreAdmiInvalid(): boolean {
    const control = this.formAdm.get('nombreAdm');
    return !!control?.invalid && control.touched;
  }
  
  get correoAdmInvalid(): boolean {
    const control = this.formAdm.get('correoAdm');
    return !!control?.invalid && control.touched;
  }

  get numeroAdmInvalid(): boolean {
    const control = this.formAdm.get('numeroAdm');
    return !!control?.invalid && control.touched;
  }

  get passworAdmdInvalid(): boolean {
    const control = this.formAdm.get('passwordAdm');
    return !!control?.invalid && control.touched;
  }

goToAdmClinics() {
  this.router.navigate(['/adm-clinics']);
}

}
