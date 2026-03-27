import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Appointment {
  id: number;
  pet: string;
  breed: string;
  petEmoji: string;
  owner: string;
  phone: string;
  service: string;
  serviceLabel: string;
  branch: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  notes: string;
  age: string;
  weight: string;
}
@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
      encapsulation: ViewEncapsulation.None,
  templateUrl: './veterinario.component.html',
  styleUrl: './veterinario.component.scss'
})
export class VeterinarioComponent implements OnInit {

  PAGE_SIZE = 6;

  allData: Appointment[] = [];
  filteredData: Appointment[] = [];

  currentPage = 1;
  selectedId: number | null = null;

  searchText = '';
  searchType = 'pet';

  filterService = '';
  filterStatus = '';
  filterBranch = '';

  dateFrom = '';
  dateTo = '';

  STATUS_MAP: any = {
    pending: { label: 'Pendiente', cls: 'badge-pending' },
    confirmed: { label: 'Confirmada', cls: 'badge-confirmed' },
    attended: { label: 'Atendida', cls: 'badge-attended' },
    cancelled: { label: 'Cancelada', cls: 'badge-cancelled' }
  };

  ngOnInit() {
    this.loadData(this.mockData());
  }

  loadData(data: Appointment[]) {
    this.allData = data;
    this.filteredData = [...data];
  }

  handleSearch() {
    this.applyFilters();
  }

  setSearchType(type: string) {
    this.searchType = type;
    this.applyFilters();
  }

  applyFilters() {

    const q = this.searchText.toLowerCase();

    this.filteredData = this.allData.filter(a => {

      let matchQ = true;

      if (q) {
        if (this.searchType === 'pet') matchQ = a.pet.toLowerCase().includes(q);
        if (this.searchType === 'owner') matchQ = a.owner.toLowerCase().includes(q);
        if (this.searchType === 'breed') matchQ = a.breed.toLowerCase().includes(q);
      }

      return matchQ
        && (!this.filterService || a.service === this.filterService)
        && (!this.filterStatus || a.status === this.filterStatus)
        && (!this.filterBranch || a.branch === this.filterBranch)
        && (!this.dateFrom || a.date >= this.dateFrom)
        && (!this.dateTo || a.date <= this.dateTo);

    });

    this.currentPage = 1;
  }

  clearFilters() {
    this.searchText = '';
    this.filterService = '';
    this.filterStatus = '';
    this.filterBranch = '';
    this.dateFrom = '';
    this.dateTo = '';

    this.filteredData = [...this.allData];
    this.currentPage = 1;
  }

  selectAppointment(id: number) {
    this.selectedId = id;
  }

  closeDetail() {
    this.selectedId = null;
  }

  changeStatus(id: number, status: string) {
    const a = this.allData.find(x => x.id === id);
    if (a) {
      a.status = status;
      this.applyFilters();
    }
  }

  saveNotes(id: number, val: string) {
    const a = this.allData.find(x => x.id === id);
    if (a) a.notes = val;
  }

  get selectedAppointment(): Appointment | undefined {
    return this.allData.find(a => a.id === this.selectedId);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.PAGE_SIZE);
  }

  get pageArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    return this.filteredData.slice(start, start + this.PAGE_SIZE);
  }

  goPage(p: number) {
    this.currentPage = p;
  }

  getStats(status: string) {
    return this.allData.filter(a => a.status === status).length;
  }

  getPageStart() {
    if (!this.filteredData.length) return 0;
    return (this.currentPage - 1) * this.PAGE_SIZE + 1;
  }

  getPageEnd() {
    return Math.min(this.currentPage * this.PAGE_SIZE, this.filteredData.length);
  }

  trackById(index: number, item: Appointment) {
    return item.id;
  }

  mockData(): Appointment[] {
    return [
      {
        id: 1,
        pet: 'Toby',
        breed: 'Labrador',
        petEmoji: '🐶',
        owner: 'Carlos Méndez',
        phone: '6441112233',
        service: 'medical',
        serviceLabel: 'Visita médica',
        branch: 'condesa',
        date: '2026-03-10',
        time: '09:00',
        status: 'pending',
        reason: 'Chequeo general',
        notes: '',
        age: '3 años',
        weight: '25kg'
      },
      {
        id: 2,
        pet: 'Luna',
        breed: 'Poodle',
        petEmoji: '🐩',
        owner: 'Ana López',
        phone: '6449981122',
        service: 'grooming',
        serviceLabel: 'Baño y corte',
        branch: 'polanco',
        date: '2026-03-11',
        time: '11:00',
        status: 'confirmed',
        reason: 'Corte de pelo',
        notes: '',
        age: '2 años',
        weight: '8kg'
      },
      {
        id: 3,
        pet: 'Max',
        breed: 'Bulldog',
        petEmoji: '🐶',
        owner: 'Pedro Ruiz',
        phone: '6447765544',
        service: 'bath',
        serviceLabel: 'Baño',
        branch: 'santafe',
        date: '2026-03-12',
        time: '15:00',
        status: 'attended',
        reason: 'Baño mensual',
        notes: 'Todo bien',
        age: '4 años',
        weight: '18kg'
      }
    ];
  }

}