import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // ← Importa RouterModule

@Component({
  selector: 'app-ubicacion',
  standalone: true,
        encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule],  // ← Agrega RouterModule aquí
  templateUrl: './ubicacion.component.html',
      styleUrl: './ubicacion.component.scss'

})
export class UbicacionComponent {

  private router = inject(Router);

  atras() {
    this.router.navigate(['/citas']);
  }

  siguiente() {
    this.router.navigate(['/citas/servicioss']);
  }

}