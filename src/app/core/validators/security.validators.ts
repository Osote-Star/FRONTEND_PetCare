// src/app/core/validators/security.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Validador anti-XSS - Bloquea caracteres peligrosos
 */
export function noXssValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /expression\s*\(/gi,
      /eval\s*\(/gi,
      /alert\s*\(/gi,
      /prompt\s*\(/gi,
      /confirm\s*\(/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return { xssDetected: true };
      }
    }
    
    return null;
  };
}

/**
 * Valida que no haya etiquetas HTML
 */
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

/**
 * Valida texto seguro (solo letras, números, espacios y caracteres básicos)
 */
export function safeTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    // Permitir: letras (con acentos), números, espacios, puntos, guiones, apóstrofes
    const safePattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\s\-\.\'’]+$/;
    if (!safePattern.test(value)) {
      return { invalidCharacters: true };
    }
    return null;
  };
}

/**
 * Validador para email más seguro
 */
export function safeEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    if (typeof value !== 'string') {
      return { invalidEmail: true };
    }
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(value)) {
      return { email: true };
    }
    
    if (value.length > 254) {
      return { emailTooLong: true };
    }
    
    return null;
  };
}

/**
 * Validador para teléfono México
 */
export function phoneValidator(countryCode: 'mx' | 'us' = 'mx'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    const cleanNumber = value.toString().replace(/\D/g, '');
    
    if (countryCode === 'mx') {
      if (cleanNumber.length !== 10) {
        return { pattern: { requiredLength: 10, actualLength: cleanNumber.length } };
      }
    }
    
    return null;
  };
}

/**
 * Validador para longitud máxima segura
 */
export function maxLengthSafeValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    if (value.length > maxLength) {
      return { maxlength: { requiredLength: maxLength, actualLength: value.length } };
    }
    return null;
  };
}

/**
 * Valida que no haya caracteres de control
 */
export function noControlCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
    if (controlChars.test(value)) {
      return { controlCharacters: true };
    }
    return null;
  };
}

/**
 * Combinación de validadores comunes para campos de texto
 */
export function textFieldValidators(minLength: number = 2, maxLength: number = 100): ValidatorFn[] {
  return [
    Validators.required,
    Validators.minLength(minLength),
    Validators.maxLength(maxLength),
    noXssValidator(),
    safeTextValidator(),
    noControlCharactersValidator()
  ];
}