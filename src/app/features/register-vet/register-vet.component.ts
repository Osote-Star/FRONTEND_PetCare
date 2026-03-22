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
  schedule: ['', Validators.required] 
});
}

//Clinicas
ngOnInit() {
  this.loadClinics();
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
 const { nombreVet, correo, numero, password, clinicId, schedule } = this.form.value;

this.authService.registerVet({
  name: nombreVet!,
  email: correo!,
  phone: numero!,
  password: password!,
  id_role: this.VET_ROLE,
  id_clinic: clinicId!,
  schedule: schedule!
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