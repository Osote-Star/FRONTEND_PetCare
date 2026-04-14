// features/donations/pages/cancelled/cancelled.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-cancelled',
  standalone: true,
  imports: [CommonModule, RouterModule, LottieComponent],
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.scss'
})
export class CancelledComponent {
  private readonly router = inject(Router);

  // Imágenes rotativas de mascotas esperando
  private readonly imagenes = [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&auto=format&fit=crop'
  ];

  imagenSeleccionada = this.imagenes[Math.floor(Math.random() * this.imagenes.length)];

  private readonly animaciones = [
  'animations/paws pet.json'
];

animacionOptions: AnimationOptions = {   // ← justo después del arreglo
  path: this.animaciones[Math.floor(Math.random() * this.animaciones.length)]
};

  volverDonaciones(): void {
    this.router.navigate(['/donaciones']);
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}