
export enum ReferralStatus {
  NEW = 'Nouveau',
  APPOINTMENT = 'Rendez-vous',
  QUOTE = 'Devis fourni',
  INSTALLED = 'Installation terminée'
}

export interface Referral {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: ReferralStatus;
  dateCreated: string;
  tokensAwarded: boolean;
  sponsorName: string;
  sponsorId: string;
  isHomeowner?: boolean;
  houseOver2Years?: boolean;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  tokenCost: number;
  euroValue?: number; // Custom value in Euros, overrides default calculation
  image: string;
  category: 'ENTRETIEN' | 'ACCESSOIRE' | 'EQUIPEMENT' | 'LOISIR' | 'CARTE CADEAU';
}

export interface Partner {
  id: string;
  companyName: string;
  category: string;
  offerDescription: string; // e.g. "-20% sur les parfums"
  department: '73' | '74' | 'AUTRE';
  image: string;
  sponsorId: string; // The sponsor who owns this business
  sponsorName: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'PROMO' | 'INFO' | 'BOOST';
  read: boolean;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;      // Added for profile
  phone: string;      // Added for profile
  address: string;    // Added for profile
  role: 'SPONSOR' | 'SUPERVISOR';
  tokens: number;
  referrals: Referral[];
  networkInstallCount: number;
}
