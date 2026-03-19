import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules,provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { httpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([httpInterceptor])
    )
  ]
};