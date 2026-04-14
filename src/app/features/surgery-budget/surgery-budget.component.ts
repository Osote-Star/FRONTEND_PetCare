// features/surgery-budget/surgery-budget.component.ts
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VetService, ServiceCategory, BudgetItem, PetInfo } from './models/surgery.model';

@Component({
  selector: 'app-surgery-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './surgery-budget.component.html',
  styleUrl: './surgery-budget.component.scss'
})
export class SurgeryBudgetComponent {

  filtroActivo: ServiceCategory | 'todos' = 'todos';
  mostrarCalculadora = false;

  petInfo: PetInfo = {
    petName: '',
    petType: 'perro',
    petAge: 0,
    petWeight: 0,
    notes: ''
  };

  carrito: BudgetItem[] = [];

  readonly servicios: VetService[] = [
    // ── CIRUGÍAS ──
    {
      id: 'ester',
      name: 'Esterilización (hembra)',
      category: 'cirugia',
      description: 'Extirpación de ovarios y útero. Previene cáncer mamario y embarazos no deseados.',
      price: 1800,
      priceNote: 'Precio base, puede variar según peso',
      icon: 'bi-gender-female'
    },
    {
      id: 'castr',
      name: 'Castración (macho)',
      category: 'cirugia',
      description: 'Extirpación de testículos. Reduce comportamientos agresivos y previene cáncer testicular.',
      price: 1200,
      priceNote: 'Precio base, puede variar según peso',
      icon: 'bi-gender-male'
    },
    {
      id: 'dental',
      name: 'Extracción dental',
      category: 'cirugia',
      description: 'Limpieza profunda y extracción de piezas dentales dañadas bajo anestesia.',
      price: 900,
      priceNote: 'Por pieza dental',
      icon: 'bi-emoji-smile'
    },
    {
      id: 'tumor',
      name: 'Cirugía de tumor',
      category: 'cirugia',
      description: 'Extirpación quirúrgica de masas o tumores. Incluye análisis histopatológico.',
      price: 3500,
      priceNote: 'Precio estimado, varía según tamaño y localización',
      icon: 'bi-heart-pulse'
    },
    {
      id: 'ortop',
      name: 'Cirugía ortopédica',
      category: 'cirugia',
      description: 'Corrección de fracturas, luxaciones y problemas articulares.',
      price: 5000,
      priceNote: 'Precio estimado según complejidad',
      icon: 'bi-bandaid'
    },
    {
      id: 'emerg',
      name: 'Cirugía de emergencia',
      category: 'cirugia',
      description: 'Intervención urgente para casos críticos. Disponible 24/7.',
      price: 4500,
      priceNote: 'Precio base, puede incrementar según complejidad',
      icon: 'bi-hospital'
    },
    // ── MEDICAMENTOS ──
    {
      id: 'antibio',
      name: 'Antibióticos',
      category: 'medicamento',
      description: 'Tratamiento para infecciones bacterianas. Dosis según peso del paciente.',
      price: 180,
      priceNote: 'Por tratamiento de 7 días',
      icon: 'bi-capsule-pill'
    },
    {
      id: 'antipar',
      name: 'Antiparasitarios',
      category: 'medicamento',
      description: 'Control de parásitos internos y externos. Aplicación mensual recomendada.',
      price: 120,
      priceNote: 'Por dosis mensual',
      icon: 'bi-bug'
    },
    {
      id: 'analg',
      name: 'Analgésicos',
      category: 'medicamento',
      description: 'Control del dolor postoperatorio o por condiciones crónicas.',
      price: 150,
      priceNote: 'Por tratamiento de 5 días',
      icon: 'bi-heart'
    },
    {
      id: 'vacuna',
      name: 'Vacunas',
      category: 'medicamento',
      description: 'Protección contra enfermedades como rabia, moquillo y parvovirus.',
      price: 250,
      priceNote: 'Por vacuna aplicada',
      icon: 'bi-shield-plus'
    },
    {
      id: 'antiinf',
      name: 'Antiinflamatorios',
      category: 'medicamento',
      description: 'Reducción de inflamación y dolor. Ideal para postoperatorio.',
      price: 130,
      priceNote: 'Por tratamiento de 5 días',
      icon: 'bi-thermometer'
    },
    {
      id: 'vitam',
      name: 'Vitaminas y suplementos',
      category: 'medicamento',
      description: 'Apoyo nutricional para mascotas en recuperación o con deficiencias.',
      price: 200,
      priceNote: 'Por mes de tratamiento',
      icon: 'bi-stars'
    }
  ];

  get serviciosFiltrados(): VetService[] {
    if (this.filtroActivo === 'todos') return this.servicios;
    return this.servicios.filter(s => s.category === this.filtroActivo);
  }

  get totalCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + (item.service.price * item.quantity), 0);
  }

  get carritoVacio(): boolean {
    return this.carrito.length === 0;
  }

  setFiltro(filtro: ServiceCategory | 'todos'): void {
    this.filtroActivo = filtro;
  }

  agregarAlCarrito(servicio: VetService): void {
    const existente = this.carrito.find(i => i.service.id === servicio.id);
    if (existente) {
      existente.quantity++;
    } else {
      this.carrito.push({ service: servicio, quantity: 1 });
    }
  }

  eliminarDelCarrito(id: string): void {
    this.carrito = this.carrito.filter(i => i.service.id !== id);
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.mostrarCalculadora = false;
  }

  calcularPresupuesto(): void {
    if (this.carritoVacio) return;
    this.mostrarCalculadora = true;
  }

  estaEnCarrito(id: string): boolean {
    return this.carrito.some(i => i.service.id === id);
  }

  cantidadEnCarrito(id: string): number {
    return this.carrito.find(i => i.service.id === id)?.quantity ?? 0;
  }
}