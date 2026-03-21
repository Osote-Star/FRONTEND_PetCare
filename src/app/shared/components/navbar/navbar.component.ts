// shared/components/navbar/navbar.component.ts
import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { AuthModalService } from '../../../features/auth/services/auth-modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private authModal = inject(AuthModalService); // 👈 AÑADIR

  isLoggedIn = this.authService.isLoggedIn;

  ngOnInit() {
    console.log('USER:', this.authService.getUser());
    console.log('ROLE:', this.authService.getUserRole());
    console.log('IS ADMIN:', this.authService.isAdmin());
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // 👈 MÉTODO PARA ABRIR MODAL EN VEZ DE REDIRIGIR
  openLoginModal(): void {
    this.authModal.openLogin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}