import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss']
})
export class ConfirmacionComponent {

  private router = inject(Router);

  // VARIABLES
  currentYear = 2026;
  currentMonth = 1;
  selectedDay = 21;

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  dayNames = [
    'Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'
  ];

  today = { d: 19, m: 1, y: 2026 };

  hasSlots = [4,5,8,10,11,12,18,19,21,22,25,26];


  atras() {
    this.router.navigate(['/citas/datos-mascota']);
  }

  siguiente() {
    this.router.navigate(['/']);
  }

  changeMonth(dir:number){
    this.currentMonth += dir;

    if (this.currentMonth > 11){
      this.currentMonth = 0;
      this.currentYear++;
    }

    if (this.currentMonth < 0){
      this.currentMonth = 11;
      this.currentYear--;
    }
  }

  selectDay(day:number){
    this.selectedDay = day;
  }

  selectSlot(time:string){
    console.log("Hora seleccionada:",time);
  }

}