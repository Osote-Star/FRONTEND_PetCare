import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // ← Importa RouterModule

@Component({
  selector: 'app-datosperro',
  standalone: true,
  imports: [CommonModule, RouterModule],
      encapsulation: ViewEncapsulation.None,
  templateUrl: './datosperro.component.html',
    styleUrl: './datosperro.component.scss'

})
export class DatosperroComponent {

   private router = inject(Router);

  atras() {
    this.router.navigate(['/citas/datos-usuario']);
  }

  siguiente() {
    this.router.navigate(['/citas/confirmacion']);
  }
}