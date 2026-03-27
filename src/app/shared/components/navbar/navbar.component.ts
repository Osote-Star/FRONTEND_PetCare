// shared/components/navbar/navbar.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
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
  private authModal = inject(AuthModalService);

  // ==================== ESTADO ====================
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  userDisplayName = this.authService.userDisplayName;
  userRole = this.authService.userRole;
  userRoleName = this.authService.userRoleName;

  // ✅ Estado para controlar si el menú móvil está abierto
  isMobileMenuOpen = signal(false);

  ngOnInit(): void {
    // ✅ No se necesita console.log - los datos se manejan via signals
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Verifica si el usuario es veterinario
   */
  isVeterinarian(): boolean {
    return this.authService.isVeterinarian();
  }

  /**
   * Verifica si el usuario es cliente
   */
  isClient(): boolean {
    return this.authService.isClient();
  }

  /**
   * Abre el modal de login
   */
  openLoginModal(): void {
    this.authModal.openLogin();
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  /**
   * Abre/cierra el menú móvil
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  /**
   * Cierra el menú móvil
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Navega a una ruta y cierra el menú móvil
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  /**
   * Obtiene las iniciales del usuario para el avatar
   */
  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}