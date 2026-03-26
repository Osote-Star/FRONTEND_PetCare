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
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly PHONE_PATTERN = /^[0-9]{10}$/;

  // ==================== ESTADO ====================
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isSubmitting = signal(false);

  // ==================== FORMULARIO ====================
  form!: FormGroup;
  hours: string[] = [];
  clinics = signal<Clinic[]>([]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService
  ) {
    this.initForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.form = this.fb.group({
      nombreVet: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      numero: ['', [Validators.required, Validators.pattern(this.PHONE_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
      clinicId: [null, [Validators.required]],
      startHour: [null, [Validators.required]], 
      endHour: [null, [Validators.required]]    
    });
  }

  /**
   * Genera las horas disponibles para el select (00:00 a 23:00)
   */
  generateHours(): void {
    for(let i = 0; i < 24; i++){
      const hour = i.toString().padStart(2, '0') + ':00';
      this.hours.push(hour);
    }
  }

  ngOnInit(): void {
    this.loadClinics();
    this.generateHours();
  }

  /**
   * Carga las clínicas disponibles
   */
  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
      },
      error: () => {
        this.error.set('No pudimos cargar las clínicas. Por favor intenta más tarde.');
      }
    });
  }

  /**
   * Valida que la hora de inicio sea menor que la hora de fin
   */
  private isValidSchedule(startHour: string, endHour: string): boolean {
    if (!startHour || !endHour) return false;
    return startHour < endHour;
  }

  /**
   * Registra un nuevo veterinario
   */
  submit(): void {
    // ✅ Validación: formulario inválido
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // ✅ Prevenir múltiples envíos
    if (this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    this.isLoading.set(true);
    this.error.set(null);
    
    const { nombreVet, correo, numero, password, clinicId, startHour, endHour } = this.form.value;

    // ✅ Validación adicional: horario
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
      schedule: schedule
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.resetForm();
        this.isSubmitting.set(false);
        
        // ✅ Ocultar mensaje de éxito después de 3 segundos
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

  /**
   * Resetea el formulario a su estado inicial
   */
  private resetForm(): void {
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

  /**
   * Cierra el mensaje de éxito
   */
  closeSuccess(): void {
    this.success.set(false);
  }

  /**
   * Getters para validación en template
   */
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
}