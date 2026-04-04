// features/auth/services/auth-modal.service.ts
import { Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { inject } from '@angular/core';

export type AuthModalMode = 'login' | 'register' | null;

/**
 * Servicio para gestionar el modal de autenticación (login/register)
 * Maneja el estado del modal, la redirección post-login y callbacks
 */
@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private router = inject(Router);
  
  // ==================== ESTADO PÚBLICO ====================
  /** Indica si el modal está abierto */
  isOpen = signal<boolean>(false);
  /** Modo actual del modal: 'login', 'register' o null */
  mode = signal<AuthModalMode>(null);
  
  // ==================== ESTADO PRIVADO ====================
  private afterLoginCallback: (() => void) | null = null;
  private returnUrl: string | null = null;

  constructor() {
    // ✅ Cerrar modal automáticamente al navegar (seguridad)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.close();
      }
    });
  }

  /**
   * Abre el modal en modo login
   * @param returnUrl - URL a redirigir después del login exitoso
   * @param callback - Función a ejecutar después del login
   */
  openLogin(returnUrl?: string, callback?: () => void): void {
    // ✅ Validación: no abrir si ya está abierto
    if (this.isOpen()) return;
    
    this.returnUrl = returnUrl || null;
    this.afterLoginCallback = callback || null;
    this.mode.set('login');
    this.isOpen.set(true);
    
    // ✅ Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  /**
   * Abre el modal en modo registro
   * @param returnUrl - URL a redirigir después del registro exitoso
   * @param callback - Función a ejecutar después del registro
   */
  openRegister(returnUrl?: string, callback?: () => void): void {
    // ✅ Validación: no abrir si ya está abierto
    if (this.isOpen()) return;
    
    this.returnUrl = returnUrl || null;
    this.afterLoginCallback = callback || null;
    this.mode.set('register');
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal y restaura el scroll
   */
  close(): void {
    if (!this.isOpen()) return;
    
    this.isOpen.set(false);
    
    // ✅ Pequeño delay para permitir animaciones
    setTimeout(() => {
      this.mode.set(null);
    }, 300);
    
    // ✅ Restaurar scroll
    document.body.style.overflow = 'auto';
  }

  /**
   * Cambia entre modo login y register
   */
  toggleMode(): void {
    const currentMode = this.mode();
    if (!currentMode) return;
    
    const newMode = currentMode === 'login' ? 'register' : 'login';
    this.mode.set(newMode);
  }

  /**
   * Ejecuta las acciones post-login (callback y redirección)
   * Debe ser llamado después de un login exitoso
   */
  runAfterLogin(): void {
    // ✅ Ejecutar callback si existe
    if (this.afterLoginCallback) {
      this.afterLoginCallback();
      this.afterLoginCallback = null; // Limpiar para evitar ejecución múltiple
    }
    
    // ✅ Redirigir si hay URL de retorno
    if (this.returnUrl) {
      const url = this.returnUrl;
      this.returnUrl = null;
      this.router.navigateByUrl(url);
    }
  }

  /**
   * Ejecuta acciones post-registro
   * Cambia automáticamente a modo login para que el usuario pueda iniciar sesión
   */
  runAfterRegister(): void {
    // ✅ Cambiar a modo login después de registro exitoso
    this.mode.set('login');
  }

  /**
   * Verifica si el modal está en modo login
   */
  isLoginMode(): boolean {
    return this.mode() === 'login';
  }

  /**
   * Verifica si el modal está en modo register
   */
  isRegisterMode(): boolean {
    return this.mode() === 'register';
  }

  /**
   * Obtiene la URL de retorno almacenada
   */
  getReturnUrl(): string | null {
    return this.returnUrl;
  }
}