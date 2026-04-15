// ✅ core/interceptors/sanitize.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SanitizerService } from '../services/sanitizer.service';

export const sanitizeInterceptor: HttpInterceptorFn = (req, next) => {
  const sanitizer = inject(SanitizerService);
  
  // Sanitizar automáticamente POST, PUT, PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = sanitizer.sanitizeObject(req.body);
    const sanitizedReq = req.clone({ body: sanitizedBody });
    return next(sanitizedReq);
  }
  
  return next(req);
};