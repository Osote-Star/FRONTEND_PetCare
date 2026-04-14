// features/surgery-budget/models/surgery.model.ts

export type ServiceCategory = 'cirugia' | 'medicamento';

export interface VetService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  priceNote?: string;
  icon: string;
}

export interface BudgetItem {
  service: VetService;
  quantity: number;
}

export interface PetInfo {
  petName: string;
  petType: string;
  petAge: number;
  petWeight: number;
  notes?: string;
}