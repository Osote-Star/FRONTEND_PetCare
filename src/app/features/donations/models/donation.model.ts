export type DonationType = 'one-time' | 'monthly';

export interface DonationOption {
  amount: number;
  label: string;
  description: string;
}

export interface CreateDonationDto {
  amount: number;
  donor_name: string;
  donor_email?: string;
  message?: string;
}

export interface CaptureDonationDto {
  paypal_order_id: string;
}

export interface Donation {
  id_donation: string;
  paypal_order_id: string;
  approval_url: string;
  amount: number;
  status: string;
  donor_name: string;
  donor_email?: string;
  message?: string;
  created_at: string;
}