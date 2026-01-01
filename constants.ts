
import { ReferralStatus, CatalogItem, Referral, Partner, Notification } from './types';

export const TOKEN_VALUE = 150;

export const COLORS = {
  primary: '#1e3a8a',
  secondary: '#22c55e',
  accent: '#facc15',
};

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'gift-150',
    title: 'Chèque Cadeau 150€',
    description: 'Carte cadeau multi-enseignes valable partout, pour vous faire plaisir selon vos envies.',
    tokenCost: 1,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400',
    category: 'CARTE CADEAU'
  },
  {
    id: 'entretien',
    title: 'Entretien Annuel Offert',
    description: 'Vérification complète de votre PAC ou installation solaire par nos techniciens.',
    tokenCost: 1,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400',
    category: 'ENTRETIEN'
  },
  {
    id: 'cache-clim',
    title: 'Cache Climatisation Alu',
    description: 'Design épuré pour protéger et masquer votre unité extérieure.',
    tokenCost: 2,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    category: 'ACCESSOIRE'
  },
  {
    id: 'solar-1',
    title: '1 Panneau Solaire Offert',
    description: 'Extension de votre installation existante avec un panneau supplémentaire (pose incluse).',
    tokenCost: 3,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400',
    category: 'EQUIPEMENT'
  },
  {
    id: 'borne',
    title: 'Borne de Recharge 7kW',
    description: 'Installation d\'une borne de recharge intelligente pour votre véhicule.',
    tokenCost: 5,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400',
    category: 'EQUIPEMENT'
  },
  {
    id: 'clim-celi',
    title: 'Clim Celi (Pièce 30m²)',
    description: 'Unité intérieure Celi offerte pour climatiser et chauffer une pièce de 30m².',
    tokenCost: 6,
    image: 'https://images.unsplash.com/photo-1617759530920-55e55418b57b?auto=format&fit=crop&q=80&w=400',
    category: 'EQUIPEMENT'
  },
  {
    id: 'solar-2',
    title: '2 Panneaux Solaires Offerts',
    description: 'Boostez votre autoconsommation avec deux panneaux supplémentaires offerts.',
    tokenCost: 6,
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=400',
    category: 'EQUIPEMENT'
  },
  {
    id: 'weekend',
    title: 'Week-end Luxe pour 2',
    description: 'Évasion gastronomique et détente d\'une valeur de 1000€ dans un hôtel étoilé.',
    tokenCost: 7,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    category: 'LOISIR'
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p1',
    companyName: 'Parfumerie des Alpes',
    category: 'Beauté',
    offerDescription: '-20% sur tous les coffrets cadeaux pour les membres Free Energie.',
    department: '74',
    image: 'https://images.unsplash.com/photo-1616401776146-24959a444d32?auto=format&fit=crop&q=80&w=400',
    sponsorId: 'user2',
    sponsorName: 'Sophie Bernard',
    status: 'VALIDATED'
  },
  {
    id: 'p2',
    companyName: 'Saveurs de Savoie',
    category: 'Gastronomie',
    offerDescription: 'Un saucisson offert pour tout achat de fromage > 30€.',
    department: '73',
    image: 'https://images.unsplash.com/photo-1624466988891-b127598c19a9?auto=format&fit=crop&q=80&w=400',
    sponsorId: 'user3',
    sponsorName: 'Thomas Petit',
    status: 'VALIDATED'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Lancement 2026 🚀',
    message: 'Bienvenue dans la nouvelle application Free Energie ! Doublez vos jetons ce mois-ci.',
    type: 'BOOST',
    read: false,
    date: '2026-01-01'
  },
  {
    id: 'n2',
    title: 'Nouveau Partenaire',
    message: 'Découvrez la Parfumerie des Alpes dans la section Communauté.',
    type: 'INFO',
    read: false,
    date: '2026-01-05'
  }
];

export const MOCK_REFERRALS: Referral[] = [];
