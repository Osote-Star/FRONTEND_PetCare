import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfService } from '../services/csrf.service';
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);
  
  // Solo agregar CSRF token a métodos que modifican datos
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const csrfToken = csrfService.getToken();
    
    if (csrfToken) {
      const csrfReq = req.clone({
        setHeaders: {
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest' // Prevenir CSRF simple
        }
      });
      return next(csrfReq);
    }
  }
  
  return next(req);
};
