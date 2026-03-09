import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // ← Importa RouterModule

@Component({
  selector: 'app-servicioss',
  standalone: true,
    encapsulation: ViewEncapsulation.None,

  imports: [RouterModule, CommonModule],
  templateUrl: './servicioss.component.html',
  styleUrl: './servicioss.component.scss'
})
export class ServiciossComponent {
 private router = inject(Router);

  atras() {
    this.router.navigate(['/citas/ubicacion']);
  }

  siguiente() {
    this.router.navigate(['/citas/datos-usuario']);
  }

}
