import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './core/interceptors/http.interceptor';


import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

provideHttpClient(withInterceptors([authInterceptor]))

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([httpInterceptor])),]
};
