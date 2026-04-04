// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules,provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor]) // ✅ Usar el interceptor correcto
    )
  ]
};