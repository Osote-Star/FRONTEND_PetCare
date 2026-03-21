// features/appointments/user/pages/confirmacion/confirmacion.component.ts
import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../services/appointment.service';
import { WizardStateService } from '../../../../services/wizard-state.service';
import { CreateAppointmentDto } from '../../../../models/appointment.model';
import { PetService } from '../../../../services/pet.service';
import { CreatePetDto, Pet } from '../../../../models/pet.model';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../../auth/models/auth.model';
import { firstValueFrom } from 'rxjs';
import { WizardClinic, WizardService } from '../../../../services/wizard-state.service';
import { TutorData, MascotaData } from '../../../../models/wizard.models';

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
  private userService = inject(UserService);

  // Estado
  isLoading = signal(false);
  error = signal('');
  success = signal(false);

  // Datos del wizard
  clinic = signal<WizardClinic | null>(null);
  service = signal<WizardService | null>(null);
  tutor = signal<TutorData | null>(null);
  mascota = signal<MascotaData | null>(null);
  
  // Selección de veterinario
  veterinarios = signal<User[]>([]);
  selectedVeterinarianId = signal<string | null>(null);
  selectedVeterinarianName = signal<string | null>(null);
  isLoadingVets = signal(false);

  // ✅ CALENDARIO REAL
  availableDates = signal<string[]>([]);
  availableSlots = signal<string[]>([]);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  isLoadingSlots = signal(false);
  isLoadingDates = signal(false);

  // Control del calendario
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Mascotas del usuario
  userPets: Pet[] = [];
  isLoadingPets = signal(false);

  // Computed
  isFormComplete = computed(() => {
    return !!(
      this.selectedVeterinarianId() &&
      this.selectedDate() &&
      this.selectedTime()
    );
  });

  ngOnInit() {
    this.clinic.set(this.wizardState.getClinic());
    this.service.set(this.wizardState.getFirstService());
    this.tutor.set(this.wizardState.getDatosTutor());
    this.mascota.set(this.wizardState.getDatosMascota());
    
    console.log('📋 Datos del wizard:', {
      clinic: this.clinic(),
      service: this.service(),
      tutor: this.tutor(),
      mascota: this.mascota()
    });
    
    this.loadVeterinarians();
    this.loadUserPets();
  }

  private validateWizardData(): boolean {
    if (!this.clinic() || !this.service() || !this.tutor() || !this.mascota()) {
      console.warn('Faltan datos del wizard, redirigiendo...');
      this.router.navigate(['/citas/datacites']);
      return false;
    }
    return true;
  }

  loadUserPets() {
    this.isLoadingPets.set(true);
    this.petService.getMyPets().subscribe({
      next: (pets: Pet[]) => {
        this.userPets = pets;
        this.isLoadingPets.set(false);
        console.log('✅ Mascotas cargadas:', pets);
      },
      error: (err) => {
        console.error('❌ Error cargando mascotas:', err);
        this.isLoadingPets.set(false);
      }
    });
  }

  loadVeterinarians() {
    this.isLoadingVets.set(true);
    
    const selectedClinic = this.wizardState.getClinic();
    
    if (!selectedClinic) {
      console.warn('⚠️ No hay clínica seleccionada');
      this.isLoadingVets.set(false);
      this.error.set('Primero debes seleccionar una clínica');
      return;
    }
    
    console.log('🏥 Cargando veterinarios para clínica:', selectedClinic.id_clinic);
    
    this.userService.getVeterinarians().subscribe({
      next: (vets: User[]) => {
        const filteredVets = vets.filter(vet => vet.id_clinic === selectedClinic.id_clinic);
        this.veterinarios.set(filteredVets);
        this.isLoadingVets.set(false);
        
        if (filteredVets.length === 0) {
          this.error.set('No hay veterinarios disponibles en esta clínica');
        } else {
          console.log('✅ Veterinarios cargados:', filteredVets);
        }
      },
      error: (err) => {
        console.error('❌ Error cargando veterinarios:', err);
        this.isLoadingVets.set(false);
        this.error.set('Error al cargar los veterinarios');
      }
    });
  }

  onVeterinarianChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const vetId = select.value;
    const vetName = select.options[select.selectedIndex]?.text;
    
    const selectedVet = this.veterinarios().find(v => v.id_user === vetId);
    
    if (!selectedVet) {
      this.error.set('Por favor selecciona un veterinario válido');
      return;
    }
    
    this.selectedVeterinarianId.set(vetId);
    this.selectedVeterinarianName.set(vetName);
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
    this.availableDates.set([]);
    
    this.wizardState.setSelectedVeterinarian({ id: vetId, name: vetName });
    
    if (vetId) {
      this.loadAvailableDates();
    }
  }

  // ✅ CARGAR FECHAS DISPONIBLES DESDE EL BACKEND
  loadAvailableDates() {
    const clinicId = this.clinic()?.id_clinic;
    const vetId = this.selectedVeterinarianId();
    
    if (!clinicId || !vetId) return;
    
    this.isLoadingDates.set(true);
    this.availableDates.set([]);
    
    this.appointmentService.getAvailableDates(clinicId, vetId).subscribe({
      next: (dates) => {
        this.availableDates.set(dates);
        this.isLoadingDates.set(false);
        console.log('✅ Fechas disponibles:', dates);
      },
      error: (err) => {
        console.error('❌ Error cargando fechas:', err);
        this.isLoadingDates.set(false);
        this.error.set('Error al cargar las fechas disponibles');
      }
    });
  }

  // ✅ VERIFICAR SI UNA FECHA ESTÁ DISPONIBLE
  isDateAvailable(day: number): boolean {
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.availableDates().includes(dateStr);
  }

  // ✅ VERIFICAR SI ES EL DÍA SELECCIONADO
  isSelectedDate(day: number): boolean {
    if (!this.selectedDate()) return false;
    const selectedStr = this.selectedDate()!;
    const currentStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedStr === currentStr;
  }

  // ✅ VERIFICAR SI ES EL DÍA DE HOY
  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }

  // ✅ SELECCIONAR UNA FECHA
  onDateSelect(day: number) {
    if (!this.isDateAvailable(day)) {
      this.error.set('Esta fecha no está disponible');
      return;
    }
    
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.selectedDate.set(dateStr);
    this.selectedTime.set(null);
    this.loadAvailableSlots(dateStr);
  }

  // ✅ CARGAR HORARIOS DISPONIBLES DESDE EL BACKEND
  loadAvailableSlots(date: string) {
    const clinicId = this.clinic()?.id_clinic;
    const vetId = this.selectedVeterinarianId();
    
    if (!clinicId || !vetId) return;
    
    this.isLoadingSlots.set(true);
    this.availableSlots.set([]);
    
    this.appointmentService.getAvailableSlots(clinicId, vetId, date).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.isLoadingSlots.set(false);
        console.log('✅ Horarios disponibles:', slots);
      },
      error: (err) => {
        console.error('❌ Error cargando horarios:', err);
        this.isLoadingSlots.set(false);
        this.error.set('Error al cargar los horarios disponibles');
      }
    });
  }

  // ✅ SELECCIONAR HORARIO
  selectTime(time: string) {
    this.selectedTime.set(time);
    if (this.selectedDate()) {
      this.wizardState.setSelectedDateTime(this.selectedDate()!, time);
    }
  }

  // ✅ NAVEGACIÓN DEL CALENDARIO
  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    // Recargar fechas disponibles para el nuevo mes
    this.loadAvailableDates();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadAvailableDates();
  }

  // ✅ OBTENER LAS SEMANAS DEL CALENDARIO
  getCalendarWeeks(): (number | null)[][] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    let startDay = firstDay.getDay();
    // Ajustar para que la semana empiece el lunes (0 = domingo, 1 = lunes...)
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Completar última semana
    while (week.length < 7 && week.length > 0) {
      week.push(null);
    }
    if (week.length > 0) {
      weeks.push(week);
    }
    
    return weeks;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async createNewPet(): Promise<string> {
    const mascota = this.mascota();
    if (!mascota) throw new Error('No hay datos de mascota');

    const dto: CreatePetDto = {
      name: mascota.nombre,
      breed: mascota.raza || 'No especificada',
      weight: parseFloat(mascota.peso) || 0,
      age: this.parseAge(mascota.edad)
    };

    return new Promise((resolve, reject) => {
      this.petService.createPet(dto).subscribe({
        next: (pet) => {
          console.log('✅ Mascota creada:', pet);
          resolve(pet.id_pet);
        },
        error: (err) => reject(err)
      });
    });
  }

  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    if (ageString.includes('mes')) return value / 12;
    return value;
  }

  async crearCita() {
    if (!this.validateWizardData()) return;
    if (!this.isFormComplete()) {
      this.error.set('Por favor selecciona veterinario, fecha y hora');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const userPayload = this.authService.getUser();
    if (!userPayload) {
      this.error.set('Debes iniciar sesión para crear una cita');
      this.isLoading.set(false);
      return;
    }

    const userId = userPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                   userPayload['nameidentifier'] || 
                   userPayload['sub'];
    
    const userRole = userPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                     userPayload['role'];

    if (!userId) {
      this.error.set('Error: No se pudo identificar al usuario');
      this.isLoading.set(false);
      return;
    }

    try {
      const clinic = this.clinic();
      const service = this.service();
      const vetId = this.selectedVeterinarianId();
      const date = this.selectedDate();
      const time = this.selectedTime();
      const mascota = this.mascota();

      if (!clinic || !service || !vetId || !date || !time || !mascota) {
        throw new Error('Faltan datos para crear la cita');
      }

      let petId = mascota.id_pet;
      const userRoleNum = userRole === 'admin' ? 1 : userRole === 'veterinario' ? 2 : 3;

      if (!petId) {
        if (userRoleNum === 3) {
          petId = await this.createNewPet();
        } else {
          this.error.set('Debes seleccionar una mascota existente');
          this.isLoading.set(false);
          return;
        }
      }

      const dateTime = `${date}T${time}:00`;

      const dto: CreateAppointmentDto = {
        id_user: userId,
        id_pet: petId,
        id_clinic: clinic.id_clinic,
        id_veterinarian: vetId,
        appointment_date: dateTime,
        service: service.name,
        cost: service.price
      };

      console.log('📅 DTO completo:', JSON.stringify(dto, null, 2));

      this.appointmentService.create(dto).subscribe({
        next: (appointment) => {
          console.log('✅ Cita creada:', appointment);
          this.isLoading.set(false);
          this.success.set(true);
          this.wizardState.reset();
          setTimeout(() => {
            this.router.navigate(['/citas/mis-citas']);
          }, 2000);
        },
        error: (err) => {
          console.error('❌ Error detallado:', err);
          const errorMsg = err.error?.message || err.message || 'Error al crear la cita';
          this.error.set(errorMsg);
          this.isLoading.set(false);
        }
      });
    } catch (err: any) {
      console.error('❌ Error en el proceso:', err);
      this.error.set(err.message || 'Error al procesar la cita');
      this.isLoading.set(false);
    }
  }

  atras() {
    this.router.navigate(['/citas/datacites']);
  }
}