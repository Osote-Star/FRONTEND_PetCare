// features/auth/services/auth-modal.service.ts
import { Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { inject } from '@angular/core';

export type AuthModalMode = 'login' | 'register' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private router = inject(Router);
  
  // Estado del modal
  isOpen = signal<boolean>(false);
  mode = signal<AuthModalMode>(null);
  
  private afterLoginCallback: (() => void) | null = null;
  private returnUrl: string | null = null;

  constructor() {
    // Cerrar modal al navegar
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.close();
      }
    });
  }

  /**
   * Abrir modal en modo login
   */
  openLogin(returnUrl?: string, callback?: () => void): void {
    console.log('🔓 Abriendo login modal, returnUrl:', returnUrl);
    this.returnUrl = returnUrl || null;
    this.afterLoginCallback = callback || null;
    this.mode.set('login');
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Abrir modal en modo register
   */
  openRegister(returnUrl?: string, callback?: () => void): void {
    console.log('🔓 Abriendo register modal, returnUrl:', returnUrl);
    this.returnUrl = returnUrl || null;
    this.afterLoginCallback = callback || null;
    this.mode.set('register');
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cerrar modal
   */
  close(): void {
    console.log('🔒 Cerrando modal');
    this.isOpen.set(false);
    setTimeout(() => {
      this.mode.set(null);
      this.returnUrl = null;
      this.afterLoginCallback = null;
    }, 300);
    document.body.style.overflow = 'auto';
  }

  /**
   * Cambiar entre login y register
   */
  toggleMode(): void {
    const newMode = this.mode() === 'login' ? 'register' : 'login';
    console.log('🔄 Cambiando modo a:', newMode);
    this.mode.set(newMode);
  }

  /**
   * Ejecutar después de login exitoso
   */
  runAfterLogin(): void {
    console.log('✅ runAfterLogin - returnUrl:', this.returnUrl);
    
    if (this.afterLoginCallback) {
      this.afterLoginCallback();
    }
    
    if (this.returnUrl) {
      console.log('🚀 Redirigiendo a:', this.returnUrl);
      this.router.navigateByUrl(this.returnUrl);
    }
    
    this.afterLoginCallback = null;
    this.returnUrl = null;
  }

  /**
   * Verificar si está en modo login
   */
  isLoginMode(): boolean {
    return this.mode() === 'login';
  }

  /**
   * Verificar si está en modo register
   */
  isRegisterMode(): boolean {
    return this.mode() === 'register';
  }

  /**
   * Obtener URL de retorno
   */
  getReturnUrl(): string | null {
    return this.returnUrl;
  }
}