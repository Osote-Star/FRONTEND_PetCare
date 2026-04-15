// shared/components/navbar/navbar.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { AuthModalService } from '../../../features/auth/services/auth-modal.service';
import { SanitizerService } from '@core/services/sanitizer.service'; // ✅ Para sanitizar texto mostrado

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
  private sanitizer = inject(SanitizerService); // ✅ Inyectar sanitizer

  // ==================== ESTADO ====================
  // ✅ Signals reactivas del AuthService
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  userDisplayName = this.authService.userDisplayName;
  userRole = this.authService.userRole;
  userRoleName = this.authService.userRoleName;

  // ✅ Estado para controlar si el menú móvil está abierto
  isMobileMenuOpen = signal(false);

  ngOnInit(): void {
    // ✅ Verificar sesión al iniciar
    this.checkSessionOnInit();
  }

  /**
   * ✅ Verifica la sesión al iniciar el componente
   * Previene que se muestre contenido de usuario no autenticado
   */
  private checkSessionOnInit(): void {
    // Si hay token pero no hay usuario, intentar cargar perfil
    if (this.isLoggedIn() && !this.currentUser()) {
      this.authService.fetchProfile().subscribe({
        error: () => {
          // Si falla, cerrar sesión silenciosamente
          this.authService.logout();
        }
      });
    }
  }

  /**
   * ✅ Obtiene el nombre del usuario de forma segura (sanitizado)
   * Previene XSS en el nombre mostrado
   */
  getSafeUserName(): string {
    const name = this.currentUser()?.name || '';
    return this.sanitizer.sanitizeText(name);
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
   * @param returnUrl - URL a redirigir después del login (opcional)
   */
  openLoginModal(returnUrl?: string): void {
    const currentUrl = returnUrl || this.router.url;
    this.authModal.openLogin(currentUrl);
  }

  /**
   * Cierra sesión de forma segura
   * ✅ Limpia todo y redirige a home
   */
  logout(): void {
    // ✅ Llamar al logout seguro del AuthService
    this.authService.logout();
    
    // ✅ Cerrar menú móvil si estaba abierto
    this.closeMobileMenu();
    
    // ✅ Opcional: Mostrar mensaje de confirmación
    console.log('Sesión cerrada correctamente');
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
   * @param route - Ruta a navegar
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  /**
   * Obtiene las iniciales del usuario para el avatar
   * ✅ Versión segura con sanitización
   */
  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    if (!name) return 'U';
    
    // ✅ Sanitizar antes de procesar
    const safeName = this.sanitizer.sanitizeText(name);
    
    const parts = safeName.split(' ');
    if (parts.length >= 2) {
      // Tomar primera letra del primer nombre y primer letra del apellido
      const firstInitial = parts[0].charAt(0);
      const lastInitial = parts[1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    // Solo un nombre, tomar primera letra
    return safeName.charAt(0).toUpperCase();
  }

  /**
   * ✅ Obtiene el rol del usuario para mostrar en UI
   */
  getRoleBadge(): string {
    const role = this.userRoleName();
    
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'veterinario':
        return 'Veterinario';
      case 'cliente':
        return 'Cliente';
      default:
        return '';
    }
  }

  /**
   * ✅ Obtiene la clase CSS para el badge del rol
   */
  getRoleBadgeClass(): string {
    const role = this.userRoleName();
    
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'veterinario':
        return 'badge-vet';
      case 'cliente':
        return 'badge-client';
      default:
        return '';
    }
  }

  /**
   * ✅ Verifica si el usuario tiene permisos para ver cierto contenido
   * @param allowedRoles - Array de roles permitidos
   */
  hasAnyRole(allowedRoles: string[]): boolean {
    const userRole = this.userRoleName();
    return allowedRoles.includes(userRole);
  }

  /**
   * ✅ Redirige al dashboard según el rol del usuario
   */
  goToDashboard(): void {
    const role = this.userRoleName();
    
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'veterinario':
        this.router.navigate(['/veterinario']);
        break;
      case 'cliente':
        this.router.navigate(['/citas/mis-citas']);
        break;
      default:
        this.router.navigate(['/']);
    }
    
    this.closeMobileMenu();
  }
  goToLogin(): void {
  this.router.navigate(['/login']);
  this.closeMobileMenu(); 
}
}