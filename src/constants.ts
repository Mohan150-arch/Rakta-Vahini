import { BloodGroup } from './types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ELIGIBILITY_DAYS = 90;

export const MOCK_DONORS = [
  { id: '1', name: 'Arjun Sharma', bloodGroup: 'O+', lastDonationDate: '2023-12-15', location: 'New Delhi', isReady: true },
  { id: '2', name: 'Priya Verma', bloodGroup: 'A+', lastDonationDate: '2024-01-20', location: 'Mumbai', isReady: true },
  { id: '3', name: 'Rahul Nair', bloodGroup: 'B+', lastDonationDate: '2024-04-10', location: 'Bangalore', isReady: true },
  { id: '4', name: 'Ananya Gupta', bloodGroup: 'O-', lastDonationDate: '2023-11-05', location: 'Kolkata', isReady: false },
  { id: '5', name: 'Vikram Singh', bloodGroup: 'O+', lastDonationDate: '2024-02-15', location: 'Chennai', isReady: true },
];
