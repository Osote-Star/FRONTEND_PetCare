export type DonationType = 'one-time' | 'monthly';

export interface DonationOption {
  amount: number;
  label: string;
  description: string;
}

export interface DonationRequest {
  amount: number;
  type: DonationType;
  donorName?: string;
  donorEmail?: string;
  message?: string;
}

export interface DonationResponse {
  id: string;
  amount: number;
  type: DonationType;
  paymentUrl: string;
  createdAt: Date;
}