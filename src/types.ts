export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  lastDonationDate: string; // ISO format
  location: string;
  isReady: boolean;
}

export interface DonationRecord {
  id: string;
  date: string;
  location: string;
  recipientGroup?: BloodGroup;
  type: 'Regular' | 'Emergency';
}
