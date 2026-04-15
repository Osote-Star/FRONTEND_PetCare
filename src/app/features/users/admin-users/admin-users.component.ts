import { Component, computed, OnInit, signal } from '@angular/core';
import { User } from '../../auth/models/auth.model';
import { UserService } from '../../auth/services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Clinic } from '../../auth/models/vet.model';
import { ClinicService } from '../../auth/services/clinic.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
// ─── State ───────────────────────────────────────────────
  users          = signal<User[]>([]);
  clinics        = signal<Clinic[]>([]);
  selectedUser   = signal<User | null>(null);
  error          = signal('');
  success        = signal('');
  confirmDeleteModal = signal(false);

  // ─── Filtros y paginación ─────────────────────────────────
  searchQuery    = signal('');
  selectedRole   = signal<number | null>(null);
  currentPage    = signal(1);
  readonly PAGE_SIZE = 10;

  /** Usuarios tras aplicar búsqueda y filtro de rol */
filteredUsers = computed(() => {
  const query = this.searchQuery().toLowerCase().trim();
  const role = this.selectedRole();

  return this.users().filter(u => {
    const name = (u.name ?? '').toLowerCase();
    const email = (u.email ?? '').toLowerCase();

    const matchesText =
      !query || name.includes(query) || email.includes(query);

    const matchesRole = role === null || u.id_role === role;

    return matchesText && matchesRole;
  });
});

  /** Total de páginas según los usuarios filtrados */
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.PAGE_SIZE))
  );

  /** Usuarios de la página actual */
  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredUsers().slice(start, start + this.PAGE_SIZE);
  });

  /**
   * Páginas visibles en el paginador (máx. 5 botones centrados en la página actual).
   * Ejemplo: si hay 10 páginas y estás en la 6 → muestra [4, 5, 6, 7, 8]
   */
  visiblePages = computed(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end   = start + maxVisible - 1;

    if (end > total) {
      end   = total;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  form!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.handleRoleChanges();
    this.loadUsers();
    this.loadClinics();
  }

  /* ================= FORM ================= */

  private initForm() {
    this.form = this.fb.group({
      id_user:   [{ value: '', disabled: true }],
      name:      ['', [Validators.required, Validators.minLength(3)]],
      email:     ['', [Validators.required, Validators.email]],
      phone:     ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      id_role:   ['', Validators.required],
      id_clinic: [null],
      schedule:  ['']
    });
  }

  private handleRoleChanges() {
    this.form.get('id_role')?.valueChanges.subscribe(role => {
      const clinicControl   = this.form.get('id_clinic');
      const scheduleControl = this.form.get('schedule');

      if (role == 2) {
        clinicControl?.setValidators([Validators.required]);
        scheduleControl?.setValidators([Validators.required]);
      } else {
        clinicControl?.clearValidators();
        scheduleControl?.clearValidators();
        this.form.patchValue({ id_clinic: null, schedule: '' });
      }

      clinicControl?.updateValueAndValidity();
      scheduleControl?.updateValueAndValidity();
    });
  }

  /* ================= LOAD DATA ================= */

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('Error cargando usuarios')
    });
  }

  loadClinics() {
    this.clinicService.getAll().subscribe({
      next: (clinics) => this.clinics.set(clinics),
      error: () => this.error.set('Error cargando clínicas')
    });
  }

  /* ================= FILTROS & PAGINACIÓN ================= */

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reiniciar página al buscar
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onRoleFilter(role: number | null) {
    this.selectedRole.set(role);
    this.currentPage.set(1); // Reiniciar página al cambiar filtro
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }


  
  /* ================= SELECT USER ================= */

  selectUser(user: User) {
    this.selectedUser.set(user);

    this.form.patchValue({
      id_user:   user.id_user,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      id_role:   user.id_role,
      id_clinic: user.id_clinic ?? null,
      schedule:  user.schedule ?? ''
    });

    this.error.set('');
    this.success.set('');
  }

  /* ================= UPDATE ================= */

  updateUser() {
    if (this.form.invalid || !this.selectedUser()) return;

    const id        = this.selectedUser()!.id_user;
    const formValue = this.form.getRawValue();

    const payload: any = {
      name:    formValue.name,
      email:   formValue.email,
      phone:   formValue.phone,
      id_role: formValue.id_role
    };

    if (formValue.id_role == 2) {
      payload.id_clinic = formValue.id_clinic;
      payload.schedule  = formValue.schedule;
    }

    this.userService.update(id, payload).subscribe({
      next: () => {
        this.success.set('Usuario actualizado correctamente');
        this.resetForm();
        this.loadUsers();
      },
      error: () => this.error.set('Error al actualizar usuario')
    });
  }

  /* ================= DELETE ================= */

  deleteUser() {
    if (!this.selectedUser()) return;
    this.confirmDeleteModal.set(true);
  }

  confirmDelete() {
    const id = this.selectedUser()!.id_user;

    this.userService.delete(id).subscribe({
      next: () => {
        this.success.set('Usuario eliminado correctamente');
        this.resetForm();
        this.loadUsers();
        this.confirmDeleteModal.set(false);
      },
      error: () => {
        this.error.set('Error al eliminar usuario');
        this.confirmDeleteModal.set(false);
      }
    });
  }

  cancelDelete() {
    this.confirmDeleteModal.set(false);
  }

  /* ================= HELPERS ================= */

  closeSuccess() {
    this.success.set('');
  }

  private resetForm() {
    this.selectedUser.set(null);

    this.form.reset({
      id_user:   '',
      name:      '',
      email:     '',
      phone:     '',
      id_role:   '',
      id_clinic: null,
      schedule:  ''
    });
  }
}