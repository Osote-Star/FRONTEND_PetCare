import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly authService  = inject(AuthService);
  readonly isLoggedIn   = this.authService.isLoggedIn;
  readonly isSuperAdmin = this.authService.isSuperAdmin;
  readonly userName     = computed(() => this.authService.currentUser()?.name);
}