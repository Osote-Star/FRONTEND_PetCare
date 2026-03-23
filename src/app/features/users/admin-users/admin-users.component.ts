import { Component, OnInit, signal } from '@angular/core';
import { User } from '../../auth/models/auth.model';
import { UserService } from '../../auth/services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Clinic } from '../../auth/models/vet.model';
import { ClinicService } from '../../auth/services/clinic-service';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule,
     ReactiveFormsModule 
  ], 
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
 users = signal<User[]>([]);
 clinics = signal<Clinic[]>([]);
  selectedUser = signal<User | null>(null);
  error = signal('');
  success = signal('');
  confirmDeleteModal = signal(false);

  form!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
      private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
 this.form = this.fb.group({
  id_user: [{ value: '', disabled: true }],
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  id_role: ['', Validators.required],
  id_clinic: [null],
  schedule: ['']
});

  this.form.get('id_role')?.valueChanges.subscribe(role => {
    if(role != 2){
      this.form.patchValue({ 
        id_clinic: null,
        schedule: null
      });
    }
    const scheduleControl = this.form.get('schedule');
    if(role == 2){
      scheduleControl?.setValidators([Validators.required]);
    } else {
      scheduleControl?.clearValidators();
    }
    scheduleControl?.updateValueAndValidity();
  });
  this.loadUsers();
  this.loadClinics();
}




loadClinics(){
  this.clinicService.getAll().subscribe({
    next: (resp) => {
      this.clinics.set(resp.data);
    },
    error: () => {
      this.error.set('Error cargando clínicas');
    }
  });
}

  loadUsers(){
    this.userService.getAll().subscribe({
      next: (resp) => this.users.set(resp.data),
      error: () => this.error.set('Error cargando usuarios')
    });
  }

  selectUser(user: User){
  this.selectedUser.set(user);

  this.form.patchValue({
  id_user: user.id_user,
  name: user.name,
  email: user.email,
  phone: user.phone,
  id_role: user.id_role,
  id_clinic: user.id_clinic ?? null,
  schedule: user.schedule ?? ''
});

  this.success.set('');
}

  updateUser(){
  if(this.form.invalid || !this.selectedUser()) return;
  const id = this.selectedUser()!.id_user;
  const formValue = this.form.getRawValue();

const payload: any = {
  name: formValue.name,
  email: formValue.email,
  phone: formValue.phone,
  id_role: formValue.id_role
};

if(formValue.id_role == 2){
  payload.id_clinic = formValue.id_clinic;
  payload.schedule = formValue.schedule;
}

  this.userService.update(id, payload).subscribe({
    next: () => {
      this.success.set('Usuario actualizado correctamente');
      this.loadUsers();
    },
    error: () => this.error.set('Error al actualizar usuario')
  });

}

 deleteUser(){
  if(!this.selectedUser()) return;
  this.confirmDeleteModal.set(true);
}

confirmDelete(){
  const id = this.selectedUser()!.id_user;

  this.userService.delete(id).subscribe({
    next: () => {
      this.success.set('Usuario eliminado correctamente');
      this.selectedUser.set(null);
      this.form.reset();
      this.loadUsers();
      this.confirmDeleteModal.set(false);
    },
    error: () => {
      this.error.set('Error al eliminar usuario');
      this.confirmDeleteModal.set(false);
    }
  });
}

closeSuccess(){
  this.success.set('');
}

cancelDelete(){
  this.confirmDeleteModal.set(false);
}

}