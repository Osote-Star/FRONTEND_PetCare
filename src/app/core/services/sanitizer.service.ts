// ✅ core/services/sanitizer.service.ts
import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SanitizerService {
  constructor(private domSanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.domSanitizer.sanitize(SecurityContext.HTML, html) || '';
  }

  sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  sanitizeObject<T>(obj: T): T {
    if (!obj) return obj;
    const sanitized: any = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}