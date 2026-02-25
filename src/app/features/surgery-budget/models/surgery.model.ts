export interface SurgeryType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDays: number;
}

export interface BudgetRequest {
  petName:          string;
  petType:          string;
  petAge:           number;
  petWeight:        number;
  surgeryTypeId:    string;
  additionalNotes?: string;
}

export interface BudgetResponse {
  id:            string;
  estimatedCost: number;
  breakdown:     { concept: string; amount: number }[];
  validUntil:    Date;
  notes:         string;
}