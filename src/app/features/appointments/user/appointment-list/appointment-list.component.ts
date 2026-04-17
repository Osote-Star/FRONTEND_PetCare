import { Component, Input, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

export type AppointmentRole = 'cliente' | 'veterinario' | 'admin';
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
  private readonly route = inject(ActivatedRoute);

  // ── Paginación ──────────────────────────────────────────
  PAGE_SIZE = 12;
  currentPage = 1;

  // ── Datos ───────────────────────────────────────────────
  allData: Appointment[] = [];
  filteredData: Appointment[] = [];

  // ── UI ──────────────────────────────────────────────────
  isLoading = true;
  errorMsg = '';
  cancellingId: string | null = null;
  deletingId: string | null = null;

  // ── Selección múltiple (solo admin) ─────────────────────
  selectedIds: Set<string> = new Set();
  isDeletingBulk = false;

  // ── Modal de confirmación ────────────────────────────────
  confirmDialog: {
    visible: boolean;
    message: string;
    action: () => void;
  } = { visible: false, message: '', action: () => { } };
  selectedId: string | null = null;

  // ── Filtros ─────────────────────────────────────────────
  searchText = '';
  filterStatus = '';
  dateFrom = '';
  dateTo = '';

  // ── Status map ──────────────────────────────────────────
  readonly STATUS_MAP: { [K in AppointmentStatus]: StatusInfo } = {
    pendiente: { label: 'Pendiente', cls: 'badge-pending' },
    confirmada: { label: 'Confirmada', cls: 'badge-confirmed' },
    atendida: { label: 'Atendida', cls: 'badge-attended' },
    cancelada: { label: 'Cancelada', cls: 'badge-cancelled' },
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
    this.errorMsg = '';

    const role = this.role as string;
    const obs$ = role === 'veterinario'
      ? this.appointmentService.getMyPatients()
      : role === 'admin'
        ? this.appointmentService.getMyClinicAppointments()
        : this.appointmentService.getMyAppointments();

    obs$.subscribe({
      next: (data) => {
        this.allData = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.message ?? 'No se pudieron cargar las citas.';
        this.isLoading = false;
      }
    });
  }

  // ── Helpers de rol ───────────────────────────────────────
  get isCliente(): boolean { return (this.role as string) === 'cliente'; }
  get isVeterinario(): boolean { return (this.role as string) === 'veterinario'; }
  get isAdmin(): boolean { return (this.role as string) === 'admin'; }

  get pageTitle(): string {
    if (this.isVeterinario) return 'Mis Pacientes';
    if (this.isAdmin) return 'Citas de mi Clínica';
    return 'Mis Citas';
  }

  get searchPlaceholder(): string {
    if (this.isVeterinario) return 'Buscar por mascota o dueño...';
    if (this.isAdmin) return 'Buscar por mascota, dueño o veterinario...';
    return 'Buscar por mascota o veterinario...';
  }

  get loadingMsg(): string {
    if (this.isVeterinario) return 'Cargando tus pacientes...';
    if (this.isAdmin) return 'Cargando citas de tu clínica...';
    return 'Cargando tus citas...';
  }

  // Segunda columna de la tabla: dueño para vet, veterinario para cliente
  getSecondColValue(a: Appointment): string {
    return this.isVeterinario ? a.user_name : a.veterinarian_name;
  }

  get secondColHeader(): string {
    return this.isVeterinario ? 'Dueño' : 'Veterinario';
  }

  // Admin también ve al dueño en columna extra
  get showOwnerCol(): boolean { return this.isAdmin; }

  // ── Filtros ──────────────────────────────────────────────
  applyFilters(): void {
    const q = this.searchText.toLowerCase().trim();

    this.filteredData = this.allData.filter(a => {
      const matchQ = !q
        || (a.pet_name ?? '').toLowerCase().includes(q)
        || (a.veterinarian_name ?? '').toLowerCase().includes(q)
        || (a.user_name ?? '').toLowerCase().includes(q);

      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      const dateStr = (a.date ?? '').substring(0, 10);
      const matchFrom = !this.dateFrom || dateStr >= this.dateFrom;
      const matchTo = !this.dateTo || dateStr <= this.dateTo;

      return matchQ && matchStatus && matchFrom && matchTo;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredData = [...this.allData];
    this.currentPage = 1;
  }

  // ── Selección ────────────────────────────────────────────
  selectAppointment(id: string): void {
    this.selectedId = this.selectedId === id ? null : id;
  }

  closeDetail(): void { this.selectedId = null; }

  get selectedAppointment(): Appointment | undefined {
    return this.allData.find(a => a.id_appointment === this.selectedId);
  }

  // ── Modal de confirmación ───────────────────────────────────
  openConfirm(message: string, action: () => void): void {
    this.confirmDialog = { visible: true, message, action };
  }

  confirmAction(): void {
    this.confirmDialog.action();
    this.confirmDialog.visible = false;
  }

  cancelConfirm(): void {
    this.confirmDialog.visible = false;
  }

  // ── Acciones ─────────────────────────────────────────────
  canCancel(a: Appointment): boolean {
    return (this.isCliente || this.isAdmin)
      && (a.status === 'pendiente' || a.status === 'confirmada');
  }

  cancelAppointment(id: string): void {
    this.openConfirm('¿Estás seguro de que deseas cancelar esta cita?', () => {
      this._doCancelAppointment(id);
    });
  }

  private _doCancelAppointment(id: string): void {
    if (this.cancellingId) return;
    this.cancellingId = id;

    this.appointmentService.cancelMyAppointment(id).subscribe({
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
    const messages: Record<string, string> = {
      confirmada: '¿Confirmar esta cita?',
      atendida: '¿Marcar esta cita como atendida?',
      cancelada: '¿Cancelar esta cita? Esta acción no se puede deshacer.',
    };
    const msg = messages[status] ?? '¿Estás seguro de realizar esta acción?';

    this.openConfirm(msg, () => this._doChangeStatus(id, status));
  }

  // ── Métodos de selección múltiple ───────────────────────
  toggleSelect(id: string, event: Event): void {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectedIds = new Set(this.selectedIds); // trigger change detection
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  get allPageSelected(): boolean {
    return this.paginatedData.length > 0
      && this.paginatedData.every(a => this.selectedIds.has(a.id_appointment));
  }

  toggleSelectAll(): void {
    if (this.allPageSelected) {
      this.paginatedData.forEach(a => this.selectedIds.delete(a.id_appointment));
    } else {
      this.paginatedData.forEach(a => this.selectedIds.add(a.id_appointment));
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  clearSelection(): void {
    this.selectedIds = new Set();
  }

  deleteSelected(): void {
    const count = this.selectedIds.size;
    this.openConfirm(
      `¿Eliminar ${count} cita${count > 1 ? 's' : ''}? Esta acción es permanente.`,
      () => this._doDeleteBulk()
    );
  }

  private _doDeleteBulk(): void {
    if (this.isDeletingBulk) return;
    this.isDeletingBulk = true;

    const ids = Array.from(this.selectedIds);
    const requests = ids.map(id => this.appointmentService.deleteAppointment(id));

    Promise.all(
      requests.map(req => new Promise<string | null>((resolve) => {
        req.subscribe({
          next: () => resolve(null),
          error: () => resolve('error')
        });
      }))
    ).then(() => {
      this.allData = this.allData.filter(a => !ids.includes(a.id_appointment));
      if (ids.includes(this.selectedId ?? '')) this.selectedId = null;
      this.selectedIds = new Set();
      this.applyFilters();
      this.isDeletingBulk = false;
    });
  }


  private _doChangeStatus(id: string, status: string): void {
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
  isDeleting(id: string): boolean { return this.deletingId === id; }

  deleteAppointment(id: string): void {
    this.openConfirm(
      '¿Eliminar esta cita? Esta acción es permanente y no se puede deshacer.',
      () => this._doDelete(id)
    );
  }

  private _doDelete(id: string): void {
    if (this.deletingId) return;
    this.deletingId = id;

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        this.allData = this.allData.filter(a => a.id_appointment !== id);
        if (this.selectedId === id) this.selectedId = null;
        this.applyFilters();
        this.deletingId = null;
      },
      error: (err) => {
        alert(err.message ?? 'No se pudo eliminar la cita.');
        this.deletingId = null;
      }
    });
  }

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