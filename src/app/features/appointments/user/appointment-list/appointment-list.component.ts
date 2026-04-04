import { Component, Input, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

export type AppointmentRole = 'cliente' | 'veterinario';
interface StatusInfo { label: string; cls: string; }

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent implements OnInit {

  @Input() role: AppointmentRole = 'cliente';

  private readonly appointmentService = inject(AppointmentService);
  private readonly route               = inject(ActivatedRoute);

  // ── Paginación ──────────────────────────────────────────
  PAGE_SIZE    = 6;
  currentPage  = 1;

  // ── Datos ───────────────────────────────────────────────
  allData:      Appointment[] = [];
  filteredData: Appointment[] = [];

  // ── UI ──────────────────────────────────────────────────
  isLoading    = true;
  errorMsg     = '';
  cancellingId: string | null = null;
  selectedId:   string | null = null;

  // ── Filtros ─────────────────────────────────────────────
  searchText   = '';
  filterStatus = '';
  dateFrom     = '';
  dateTo       = '';

  // ── Status map ──────────────────────────────────────────
  readonly STATUS_MAP: { [K in AppointmentStatus]: StatusInfo } = {
    pendiente:  { label: 'Pendiente',  cls: 'badge-pending'   },
    confirmada: { label: 'Confirmada', cls: 'badge-confirmed' },
    atendida:   { label: 'Atendida',   cls: 'badge-attended'  },
    cancelada:  { label: 'Cancelada',  cls: 'badge-cancelled' },
  };

  // ════════════════════════════════════════════════════════
  ngOnInit(): void {
    // Permite recibir el rol también desde data de la ruta
    const routeRole = this.route.snapshot.data['role'] as AppointmentRole;
    if (routeRole) this.role = routeRole;

    this.loadAppointments();
  }

  // ── Carga según rol ──────────────────────────────────────
  loadAppointments(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    const obs$ = this.role === 'veterinario'
      ? this.appointmentService.getMyPatients()
      : this.appointmentService.getMyAppointments();

    obs$.subscribe({
      next: (data) => {
        this.allData   = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg  = err.message ?? 'No se pudieron cargar las citas.';
        this.isLoading = false;
      }
    });
  }

  // ── Helpers de rol ───────────────────────────────────────
  get isCliente():     boolean { return this.role === 'cliente';     }
  get isVeterinario(): boolean { return this.role === 'veterinario'; }

  get pageTitle(): string {
    return this.isVeterinario ? 'Mis Pacientes' : 'Mis Citas';
  }

  get searchPlaceholder(): string {
    return this.isVeterinario
      ? 'Buscar por mascota o dueño...'
      : 'Buscar por mascota o veterinario...';
  }

  get loadingMsg(): string {
    return this.isVeterinario ? 'Cargando tus pacientes...' : 'Cargando tus citas...';
  }

  // Segunda columna de la tabla: dueño para vet, veterinario para cliente
  getSecondColValue(a: Appointment): string {
    return this.isVeterinario ? a.user_name : a.veterinarian_name;
  }

  get secondColHeader(): string {
    return this.isVeterinario ? 'Dueño' : 'Veterinario';
  }

  // ── Filtros ──────────────────────────────────────────────
  applyFilters(): void {
    const q = this.searchText.toLowerCase().trim();

    this.filteredData = this.allData.filter(a => {
      const matchQ = !q
        || (a.pet_name          ?? '').toLowerCase().includes(q)
        || (a.veterinarian_name ?? '').toLowerCase().includes(q)
        || (a.user_name         ?? '').toLowerCase().includes(q);

      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      const dateStr     = (a.date ?? '').substring(0, 10);
      const matchFrom   = !this.dateFrom || dateStr >= this.dateFrom;
      const matchTo     = !this.dateTo   || dateStr <= this.dateTo;

      return matchQ && matchStatus && matchFrom && matchTo;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText   = '';
    this.filterStatus = '';
    this.dateFrom     = '';
    this.dateTo       = '';
    this.filteredData = [...this.allData];
    this.currentPage  = 1;
  }

  // ── Selección ────────────────────────────────────────────
  selectAppointment(id: string): void {
    this.selectedId = this.selectedId === id ? null : id;
  }

  closeDetail(): void { this.selectedId = null; }

  get selectedAppointment(): Appointment | undefined {
    return this.allData.find(a => a.id_appointment === this.selectedId);
  }

  // ── Acciones ─────────────────────────────────────────────
  canCancel(a: Appointment): boolean {
    // Solo el cliente puede cancelar, y solo si está pendiente o confirmada
    return this.isCliente && (a.status === 'pendiente' || a.status === 'confirmada');
  }

  cancelAppointment(id: string): void {
    if (this.cancellingId) return;
    this.cancellingId = id;

    this.appointmentService.changeStatus(id, 'cancelada').subscribe({
      next: (updated) => {
        const idx = this.allData.findIndex(a => a.id_appointment === id);
        if (idx !== -1) this.allData[idx] = updated;
        this.applyFilters();
        this.cancellingId = null;
      },
      error: (err) => {
        alert(err.message ?? 'No se pudo cancelar la cita.');
        this.cancellingId = null;
      }
    });
  }

  changeStatus(id: string, status: string): void {
    this.appointmentService.changeStatus(id, status).subscribe({
      next: (updated) => {
        const idx = this.allData.findIndex(a => a.id_appointment === id);
        if (idx !== -1) this.allData[idx] = updated;
        this.applyFilters();
      },
      error: (err) => alert(err.message ?? 'Error al cambiar estado.')
    });
  }

  isCancelling(id: string): boolean { return this.cancellingId === id; }

  // ── Helpers de fecha ─────────────────────────────────────
  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  formatDateShort(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Stats ────────────────────────────────────────────────
  getStats(status: AppointmentStatus): number {
    return this.allData.filter(a => a.status === status).length;
  }

  getStatusInfo(status: string): StatusInfo {
    return this.STATUS_MAP[status as AppointmentStatus] ?? { label: status, cls: '' };
  }

  // ── Paginación ───────────────────────────────────────────
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.PAGE_SIZE));
  }

  get pageArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedData(): Appointment[] {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    return this.filteredData.slice(start, start + this.PAGE_SIZE);
  }

  goPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getPageStart(): number {
    return this.filteredData.length ? (this.currentPage - 1) * this.PAGE_SIZE + 1 : 0;
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.PAGE_SIZE, this.filteredData.length);
  }

  trackById(_: number, item: Appointment): string { return item.id_appointment; }
}