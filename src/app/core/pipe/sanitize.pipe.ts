// ✅ core/pipes/sanitize.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { SanitizerService } from '../services/sanitizer.service';

@Pipe({
  name: 'sanitize',
  standalone: true
})
export class SanitizePipe implements PipeTransform {
  private sanitizer = inject(SanitizerService);
  
  transform(value: string | null | undefined, type: 'text' | 'html' = 'text'): string {
    if (!value) return '';
    
    if (type === 'html') {
      return String(this.sanitizer.sanitizeHtml(value));
    }
    return this.sanitizer.sanitizeText(value);
  }
}