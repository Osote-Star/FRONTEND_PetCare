// features/donations/pages/success/success.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule, LottieComponent],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly donationService = inject(DonationService);

  cargando = true;
  exito = false;
  monto = 0;
  errorMsg = '';

  // Imágenes rotativas
  private readonly imagenes = [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop'
  ];

  imagenSeleccionada = this.imagenes[Math.floor(Math.random() * this.imagenes.length)];

  // Animaciones rotativas  ← aquí va
  private readonly animaciones = [
    'animations/Doggo.json',
    'animations/paws pet.json',
    'animations/Cute Doggie.json',
    'animations/Happy Dog.json'
  ];

  animacionOptions: AnimationOptions = {   // ← justo después del arreglo
    path: this.animaciones[Math.floor(Math.random() * this.animaciones.length)]
  };

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMsg = 'No se encontró el token de PayPal';
      this.cargando = false;
      return;
    }


    this.donationService.captureOrder({ paypal_order_id: token }).subscribe({
      next: (donation) => {
        this.exito = true;
        this.monto = donation.amount;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMsg = 'Esta orden ya fue procesada o expiró.';
        this.cargando = false;
      }
    });
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}