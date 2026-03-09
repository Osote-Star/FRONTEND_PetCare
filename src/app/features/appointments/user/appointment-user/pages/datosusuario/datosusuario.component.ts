import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // ← Importa RouterModule

@Component({
  selector: 'app-datosusuario',
  standalone: true,
          encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule],
  templateUrl: './datosusuario.component.html',
        styleUrl: './datosusuario.component.scss'

})
export class DatosusuarioComponent {

  private router = inject(Router);

  atras() {
    this.router.navigate(['/citas/servicioss']);
  }

  siguiente() {
    this.router.navigate(['/citas/datos-mascota']);
  }

}