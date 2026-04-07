// ✅ core/validators/security.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Prevenir XSS en inputs
export function noXssValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    const dangerousPatterns = [
      /<script\b/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return { xssDetected: true };
      }
    }
    return null;
  };
}

// Prevenir inyección de HTML
export function noHtmlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    const htmlPattern = /<[^>]*>/g;
    if (htmlPattern.test(value)) {
      return { htmlDetected: true };
    }
    return null;
  };
}

// Validar solo texto seguro (letras, números, espacios básicos)
export function safeTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    // Permitir: letras (con acentos), números, espacios, puntos, guiones
    const safePattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\s\-\.]+$/;
    if (!safePattern.test(value)) {
      return { invalidCharacters: true };
    }
    return null;
  };
}