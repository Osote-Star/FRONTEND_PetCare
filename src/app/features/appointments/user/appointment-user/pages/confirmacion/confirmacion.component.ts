// features/appointments/pages/appointment-wizard/steps/step-5-confirm/step-5-confirm.component.ts
import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../services/appointment.service';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { CreateAppointmentDto } from '../../../../models/appointment.model';
import { PetService } from '../../../../services/pet.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { User } from '../../../../../auth/models/auth.model';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss']
})
export class ConfirmacionComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private wizardState = inject(WizardStateService);
  private authService = inject(AuthService);
  private petService = inject(PetService);

  // ==================== ESTADO ====================
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isSubmitting = signal(false);

  // Datos del wizard
  wizardData = computed(() => this.wizardState.getSummary());
  
  // ==================== VETERINARIO ====================
  veterinarios = signal<User[]>([]);
  selectedVeterinarianId = signal<string | null>(null);
  selectedVeterinarianName = signal<string | null>(null);
  isLoadingVets = signal(false);

  // ==================== CALENDARIO ====================
  availableDates = signal<string[]>([]);
  selectedDate = signal<string | null>(null);
  isLoadingDates = signal(false);
  
  // ==================== HORARIOS ====================
  availableSlots = signal<string[]>([]);
  selectedTime = signal<string | null>(null);
  isLoadingSlots = signal(false);

  // ==================== CONTROL DEL CALENDARIO ====================
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // ==================== COMPUTED ====================
  clinic = computed(() => ({
    name: this.wizardData().clinicName ?? ''
  }));

  service = computed(() => ({
    name: this.wizardData().service ?? '',
    price: this.wizardData().cost ?? 0
  }));

  mascota = computed(() => ({
    nombre: this.wizardData().petName ?? ''
  }));
  
  isFormComplete = computed(() => {
    return !!(
      this.selectedVeterinarianId() &&
      this.selectedDate() &&
      this.selectedTime()
    );
  });

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadVeterinarians();
  }

  // ==================== VETERINARIOS ====================
  loadVeterinarians(): void {
    const clinicId = this.wizardData().clinicId;
    
    if (!clinicId) {
      this.error.set('Primero debes seleccionar una clínica');
      return;
    }
    
    this.isLoadingVets.set(true);
    this.error.set(null);
    
    this.authService.getVeterinarians().subscribe({
      next: (vets) => {
        const filteredVets = vets.filter(vet => vet.id_clinic === clinicId);
        this.veterinarios.set(filteredVets);
        this.isLoadingVets.set(false);
        
        if (filteredVets.length === 0) {
          this.error.set('No hay veterinarios disponibles en esta clínica');
        }
        
        this.restoreSelectedVeterinarian(filteredVets);
      },
      error: () => {
        this.error.set('No pudimos cargar los veterinarios. Por favor intenta más tarde.');
        this.isLoadingVets.set(false);
      }
    });
  }

  private restoreSelectedVeterinarian(vets: User[]): void {
    const currentVetId = this.wizardData().veterinarianId;
    if (currentVetId) {
      const savedVet = vets.find(v => v.id_user === currentVetId);
      if (savedVet) {
        this.selectedVeterinarianId.set(currentVetId);
        this.selectedVeterinarianName.set(savedVet.name);
        this.loadAvailableDates();
      }
    }
  }

  onVeterinarianChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const vetId = select.value;
    const vetName = select.options[select.selectedIndex]?.text;
    
    if (!vetId) return;
    
    this.selectedVeterinarianId.set(vetId);
    this.selectedVeterinarianName.set(vetName);
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
    this.availableDates.set([]);
    this.error.set(null);
    
    this.wizardState.setSelectedVeterinarian({ id: vetId, name: vetName || '' });
    this.loadAvailableDates();
  }

  // ==================== FECHAS DISPONIBLES ====================
  loadAvailableDates(): void {
    const vetId = this.selectedVeterinarianId();
    if (!vetId) return;
    
    this.isLoadingDates.set(true);
    this.error.set(null);
    this.availableDates.set([]);
    
    this.appointmentService.getAvailableDates(vetId).subscribe({
      next: (dates) => {
        this.availableDates.set(dates);
        this.isLoadingDates.set(false);
        
        if (dates.length === 0) {
          this.error.set('No hay fechas disponibles en los próximos 30 días');
        }
      },
      error: () => {
        this.error.set('No pudimos cargar las fechas disponibles. Por favor intenta más tarde.');
        this.isLoadingDates.set(false);
      }
    });
  }

  isDateAvailable(day: number): boolean {
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.availableDates().includes(dateStr);
  }

  isSelectedDate(day: number): boolean {
    if (!this.selectedDate()) return false;
    const selectedStr = this.selectedDate()!;
    const currentStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedStr === currentStr;
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }

  onDateSelect(day: number): void {
    if (!this.isDateAvailable(day)) {
      this.error.set('Esta fecha no está disponible');
      return;
    }
    
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.selectedDate.set(dateStr);
    this.selectedTime.set(null);
    this.error.set(null);
    this.loadSlotsForDate(dateStr);
  }

  // ==================== HORARIOS DISPONIBLES ====================
  loadSlotsForDate(date: string): void {
    const vetId = this.selectedVeterinarianId();
    if (!vetId || !date) return;
    
    this.isLoadingSlots.set(true);
    this.error.set(null);
    this.availableSlots.set([]);
    
    const dateTime = `${date}T00:00:00`;
    
    this.appointmentService.getAvailableSlots(vetId, dateTime).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.isLoadingSlots.set(false);
        
        if (slots.length === 0) {
          this.error.set('No hay horarios disponibles para esta fecha');
        }
      },
      error: () => {
        this.error.set('No pudimos cargar los horarios disponibles. Por favor intenta más tarde.');
        this.isLoadingSlots.set(false);
      }
    });
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
    this.wizardState.setSelectedDateTime(this.selectedDate()!, time);
    this.error.set(null);
  }

  // ==================== NAVEGACIÓN DEL CALENDARIO ====================
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  getCalendarWeeks(): (number | null)[][] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    while (week.length < 7 && week.length > 0) {
      week.push(null);
    }
    if (week.length > 0) {
      weeks.push(week);
    }
    
    return weeks;
  }

  // ==================== CREAR CITA ====================
  crearCita(): void {
    // ✅ Validaciones antes de enviar
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error.set('Debes iniciar sesión para crear una cita');
      return;
    }

    if (!this.isFormComplete()) {
      this.error.set('Por favor selecciona veterinario, fecha y hora');
      return;
    }

    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.isLoading.set(true);
    this.error.set(null);

    const wizardData = this.wizardData();
    const vetId = this.selectedVeterinarianId();
    const date = this.selectedDate();
    const time = this.selectedTime();
    const petId = wizardData.petId;

    // ✅ Validaciones de datos
    if (!wizardData.clinicId || !wizardData.service || !vetId || !date || !time) {
      this.error.set('Faltan datos para crear la cita');
      this.isLoading.set(false);
      this.isSubmitting.set(false);
      return;
    }

    if (!petId) {
      this.error.set('No se encontró la mascota seleccionada');
      this.isLoading.set(false);
      this.isSubmitting.set(false);
      return;
    }

    // ✅ Convertir a UTC antes de enviar
    const dateTime = this.buildUtcDateTime(date, time);
    
    const dto: CreateAppointmentDto = {
      id_user: currentUser.id_user,
      id_pet: petId,
      id_clinic: wizardData.clinicId,
      id_veterinarian: vetId,
      appointment_date: dateTime,
      service: wizardData.service,
      cost: wizardData.cost || 0
    };

    this.appointmentService.create(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.wizardState.reset();
        setTimeout(() => {
          this.router.navigate(['/citas/mis-citas']);
        }, 2000);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.error.set('No pudimos crear tu cita. Por favor intenta más tarde.');
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Construye fecha UTC a partir de fecha y hora local
   * @private
   */
  private buildUtcDateTime(date: string, time: string): string {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    
    const utcDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    ));
    
    return utcDate.toISOString();
  }

  atras(): void {
    this.router.navigate(['/citas/datacites']);
  }
}