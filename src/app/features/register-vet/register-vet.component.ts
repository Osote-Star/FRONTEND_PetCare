import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Clinic } from '../auth/models/vet.model';
import { ClinicService } from '../auth/services/clinic-service';

@Component({
  selector: 'app-register-vet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-vet.component.html',
  styleUrl: './register-vet.component.scss'
})
export class RegisterVetComponent {
  private readonly VET_ROLE = 2;

  isLoading = signal(false);
  error = signal('');
  success = signal(false);

  form!: FormGroup;
  hours: string[] = [];
  clinics = signal<Clinic[]>([]);

  constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private clinicService: ClinicService
) {

  this.form = this.fb.group({
  nombreVet: ['', [Validators.required]],
  correo: ['', [Validators.required, Validators.email]],
  numero: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  clinicId: [null, Validators.required],

  startHour: [null, Validators.required], 
  endHour: [null, Validators.required]    
});
}

generateHours() {
  for(let i = 0; i < 24; i++){
    const hour = i.toString().padStart(2, '0') + ':00';
    this.hours.push(hour);
  }
}

//Clinicas
ngOnInit() {
  this.loadClinics();
  this.generateHours();
}

loadClinics(){
  this.clinicService.getAll().subscribe({
    next: (resp) => {
      this.clinics.set(resp.data);
    },
    error: (err) => {
      console.log(err);
      this.error.set('Error cargando clínicas');
    }
  });
}

//registrar
  submit(): void {
  if (this.form.invalid) return;
  this.isLoading.set(true);
  this.error.set('');
 const { nombreVet, correo, numero, password, clinicId, startHour, endHour } = this.form.value;

const schedule = `${startHour} - ${endHour}`;

if(startHour >= endHour){
  this.error.set('La hora de inicio debe ser menor a la hora final');
  this.isLoading.set(false);
  return;
}

this.authService.registerVet({
  name: nombreVet!,
  email: correo!,
  phone: numero!,
  password: password!,
  id_role: this.VET_ROLE,
  id_clinic: clinicId!,
  schedule: schedule
}).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.success.set(true);
      this.form.reset();
      this.form.markAsPristine();
      this.form.markAsUntouched();
    },
    error: (err) => {
      this.error.set(err.error?.message ?? 'Error al registrar veterinario');
      this.isLoading.set(false);
    }
  });
}

  closeSuccess(){
  this.success.set(false);
}


}