
import React, { useState, useEffect } from 'react';
import { User, Referral, ReferralStatus, CatalogItem, Partner, Notification } from './types';
import { MOCK_REFERRALS, INITIAL_CATALOG_ITEMS, INITIAL_PARTNERS, MOCK_NOTIFICATIONS } from './constants';
import Dashboard from './components/Dashboard';
import TrackingTable from './components/TrackingTable';
import ReferralForm from './components/ReferralForm';
import Catalog from './components/Catalog';
import SupervisorDashboard from './components/SupervisorDashboard';
import PartnerNetwork from './components/PartnerNetwork';
import LaunchOfferModal from './components/LaunchOfferModal';
import EnergySimulator from './components/EnergySimulator';
import VideoPresentationModal from './components/VideoPresentationModal';
import LoginScreen from './components/LoginScreen';
import ProfileModal from './components/ProfileModal';
import { generateReferralPitch } from './geminiService';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- PERSISTENCE HELPERS ---
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // --- STATE INITIALIZATION WITH LOCAL STORAGE ---

  const [user, setUser] = useState<User>(() => loadState('app_user', {
    id: 'user1',
    name: 'Nourddine Abdelhalim',
    email: 'n.ab@freeenergie.fr',
    phone: '06 12 34 56 78',
    address: '73000 Chambéry',
    role: 'SPONSOR',
    tokens: 0,
    referrals: MOCK_REFERRALS,
    networkInstallCount: 0 
  }));
  
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => loadState('app_catalog', INITIAL_CATALOG_ITEMS));
  const [partners, setPartners] = useState<Partner[]>(() => loadState('app_partners', INITIAL_PARTNERS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('app_notifications', MOCK_NOTIFICATIONS));
  
  // State for dynamic features (UI only, no persistence needed)
  const [showNotifications, setShowNotifications] = useState(false);
  // Only show launch offer if user has no referrals yet
  const [showLaunchOffer, setShowLaunchOffer] = useState(() => {
     const savedUser = localStorage.getItem('app_user');
     if (savedUser) {
       const parsed = JSON.parse(savedUser);
       return parsed.referrals.length === 0;
     }
     return true;
  });
  
  const [showSimulator, setShowSimulator] = useState(false); 
  const [showVideoModal, setShowVideoModal] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [manualBonusTokens, setManualBonusTokens] = useState(() => loadState('app_bonus_tokens', 0)); 

  // Admin / Security State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'referrals' | 'catalog' | 'community' | 'supervisor'>('dashboard');
  const [isAddingReferral, setIsAddingReferral] = useState(false);
  const [aiPitch, setAiPitch] = useState<string>('');
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [unreadLeadsCount, setUnreadLeadsCount] = useState(0);

  // --- SAVE EFFECTS ---
  useEffect(() => { localStorage.setItem('app_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('app_catalog', JSON.stringify(catalogItems)); }, [catalogItems]);
  useEffect(() => { localStorage.setItem('app_partners', JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem('app_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('app_bonus_tokens', JSON.stringify(manualBonusTokens)); }, [manualBonusTokens]);


  // Sync role with tab (just for simulation)
  useEffect(() => {
    if (activeTab === 'supervisor') {
      setUser(prev => ({ 
        ...prev, 
        role: 'SUPERVISOR',
        name: 'Nourddine Abdelhalim'
      }));
      setUnreadLeadsCount(0);
    } else {
      setUser(prev => ({ 
        ...prev, 
        role: 'SPONSOR',
        name: 'Nourddine Abdelhalim'
      }));
    }
  }, [activeTab]);

  // Calculate tokens
  useEffect(() => {
    const installedReferrals = user.referrals
      .filter(r => r.status === ReferralStatus.INSTALLED)
      .sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()); 

    let calculatedTokens = 0;

    installedReferrals.forEach((_, index) => {
      const positionInCycle = (index + 1) % 3;
      if (positionInCycle === 0) {
        calculatedTokens += 3;
      } else {
        calculatedTokens += 1;
      }
    });

    const totalTokens = calculatedTokens + manualBonusTokens;
    // Only update if different to avoid loop
    if (user.tokens !== totalTokens) {
      setUser(prev => ({ ...prev, tokens: totalTokens }));
    }
  }, [user.referrals, manualBonusTokens]); // Removed user.id/tokens from dep array to avoid loop

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === 'supervisor') {
      if (isAdminAuthenticated) {
        setActiveTab('supervisor');
      } else {
        setShowAdminLogin(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '4774') {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setActiveTab('supervisor');
      setAdminPin('');
    } else {
      alert("Code PIN incorrect");
      setAdminPin('');
    }
  };

  const handleAddReferral = (newReferral: Referral) => {
    const enrichedReferral = {
      ...newReferral,
      sponsorName: user.name,
      sponsorId: user.id
    };
    setUser(prev => ({
      ...prev,
      referrals: [enrichedReferral, ...prev.referrals]
    }));
    setUnreadLeadsCount(prev => prev + 1);
    setIsAddingReferral(false);
  };

  const handleBatchAddReferrals = (contacts: { name: string; phone: string }[]) => {
    const newReferrals: Referral[] = contacts.map(c => ({
      id: Math.random().toString(36).substr(2, 9),
      name: c.name,
      phone: c.phone,
      email: '', 
      address: '', 
      status: ReferralStatus.NEW,
      dateCreated: new Date().toISOString().split('T')[0],
      tokensAwarded: false,
      sponsorName: user.name,
      sponsorId: user.id,
      isHomeowner: true,
      houseOver2Years: true
    }));

    setUser(prev => ({
      ...prev,
      referrals: [...newReferrals, ...prev.referrals]
    }));

    setManualBonusTokens(prev => prev + 1);
    
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'Bonus de Lancement !',
      message: 'Félicitations ! Vous avez gagné 150€ de crédit immédiatement.',
      type: 'BOOST',
      read: false,
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);

    setShowLaunchOffer(false);
    setUnreadLeadsCount(prev => prev + 5);
  };

  const handleUpdateStatus = (id: string, newStatus: ReferralStatus) => {
    setUser(prev => ({
      ...prev,
      referrals: prev.referrals.map(r => r.id === id ? { ...r, status: newStatus } : r)
    }));
  };

  const handleRedeem = (item: any) => {
    if (user.tokens >= item.tokenCost) {
      alert(`Votre demande pour "${item.title}" est enregistrée. Un conseiller Free Energie vous contactera.`);
    }
  };

  const handleAddCatalogItem = (newItem: CatalogItem) => {
    setCatalogItems([...catalogItems, newItem]);
  };

  const handleUpdateCatalogItem = (id: string, updates: Partial<CatalogItem>) => {
    setCatalogItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalogItems(catalogItems.filter(item => item.id !== id));
  };

  const handleAddPartner = (newPartner: Partner) => {
    setPartners([newPartner, ...partners]);
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: 'Partenaire en attente',
      message: `Votre demande pour ${newPartner.companyName} a été envoyée pour validation.`,
      type: 'INFO',
      read: false,
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
  };

  const handleUpdatePartnerStatus = (id: string, status: 'VALIDATED' | 'REJECTED') => {
    setPartners(partners.map(p => p.id === id ? { ...p, status } : p));
    if (status === 'VALIDATED') {
      const partner = partners.find(p => p.id === id);
      if (partner) {
        setNotifications(prev => [{
          id: Date.now().toString(),
          title: 'Nouveau Partenaire !',
          message: `${partner.companyName} rejoint le réseau. Profitez de ${partner.offerDescription}`,
          type: 'INFO',
          read: false,
          date: new Date().toISOString().split('T')[0]
        }, ...prev]);
      }
    }
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const handleBookAppointment = () => {
    // URL spécifique pour la prise de rendez-vous "Bilan Énergétique"
    const PLANNING_URL = "https://calendar.app.google/N5JENFfZpFR2x1aF7";
    
    window.open(PLANNING_URL, "_blank");
  };

  const loadAiPitch = async () => {
    if (!isAuthenticated) return; 
    setIsLoadingPitch(true);
    const pitch = await generateReferralPitch(user.name);
    setAiPitch(pitch);
    setIsLoadingPitch(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAiPitch();
    }
  }, [isAuthenticated]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Launch Offer Modal */}
      {showLaunchOffer && (
        <LaunchOfferModal 
          onSubmit={handleBatchAddReferrals} 
          onClose={() => setShowLaunchOffer(false)} 
        />
      )}
      
      {/* Energy Simulator Modal */}
      {showSimulator && (
        <EnergySimulator onClose={() => setShowSimulator(false)} />
      )}

      {/* Video Presentation Modal */}
      {showVideoModal && (
        <VideoPresentationModal onClose={() => setShowVideoModal(false)} />
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onUpdate={handleUpdateProfile} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-black text-blue-900 mb-2">Accès Superviseur</h3>
              <p className="text-gray-500 text-xs mb-6">Zone réservée à l'installateur</p>
              <form onSubmit={handleAdminLogin}>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="Code PIN"
                  className="w-full text-center text-2xl font-black tracking-[1em] py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:ring-0 mb-6 text-blue-900"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 rounded-xl">Annuler</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-800">Valider</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-blue-900 text-white py-1 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em]">
        Free Energie - L'autonomie énergétique pour tous
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange('dashboard')}>
              <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-black text-blue-900 leading-none block">FREE <span className="text-green-500">ENERGIE</span></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parrainage</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleTabChange('dashboard')} className={`text-xs font-black uppercase tracking-widest py-8 transition-all ${activeTab === 'dashboard' ? 'text-blue-900 border-b-4 border-green-500' : 'text-gray-400 hover:text-blue-900'}`}>Tableau de Bord</button>
              <button onClick={() => handleTabChange('referrals')} className={`text-xs font-black uppercase tracking-widest py-8 transition-all ${activeTab === 'referrals' ? 'text-blue-900 border-b-4 border-green-500' : 'text-gray-400 hover:text-blue-900'}`}>Mes Filleuls</button>
              <button onClick={() => handleTabChange('catalog')} className={`text-xs font-black uppercase tracking-widest py-8 transition-all ${activeTab === 'catalog' ? 'text-blue-900 border-b-4 border-green-500' : 'text-gray-400 hover:text-blue-900'}`}>Boutique</button>
              <button onClick={() => handleTabChange('community')} className={`text-xs font-black uppercase tracking-widest py-8 transition-all ${activeTab === 'community' ? 'text-blue-900 border-b-4 border-green-500' : 'text-gray-400 hover:text-blue-900'}`}>Communauté</button>
              
              <button 
                onClick={() => handleTabChange('supervisor')}
                className={`relative text-xs font-black uppercase tracking-widest py-3 px-6 rounded-full transition-all flex items-center group ${activeTab === 'supervisor' ? 'bg-blue-900 text-white shadow-xl' : 'text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
              >
                Superviseur
                {unreadLeadsCount > 0 && !isAdminAuthenticated && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] items-center justify-center text-white border-2 border-white">{unreadLeadsCount}</span>
                  </span>
                )}
                <span className="ml-2 opacity-50">🔒</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
               {/* Discover Concept Video Button */}
               <button 
                  onClick={() => setShowVideoModal(true)}
                  className="hidden lg:flex bg-blue-50 text-blue-900 border border-blue-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest items-center hover:bg-blue-100 transition-colors"
               >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Le Concept
               </button>

               {/* Appointment Button (For Leads/Sponsors) */}
               <button 
                  onClick={handleBookAppointment}
                  className="hidden lg:flex bg-green-500 text-blue-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest items-center hover:bg-green-400 transition-colors"
               >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Prendre RDV
               </button>

               {/* Notifications */}
               <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-400 hover:text-blue-900 relative">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                   {unreadNotifCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>}
                 </button>
                 {showNotifications && (
                   <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="bg-blue-900 p-4 text-white font-black text-xs uppercase tracking-widest flex justify-between">
                       <span>Notifications</span>
                       <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-green-400 hover:text-white">Tout lu</button>
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-6 text-center text-gray-400 text-xs">Aucune notification</div>
                       ) : (
                         notifications.map(n => (
                           <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                             <div className="flex justify-between items-start mb-1">
                               <h5 className="text-sm font-bold text-blue-900">{n.title}</h5>
                               <span className="text-[9px] text-gray-400">{n.date}</span>
                             </div>
                             <p className="text-xs text-gray-500 leading-snug">{n.message}</p>
                           </div>
                         ))
                       )}
                     </div>
                   </div>
                 )}
               </div>

               {/* Profile Button (Now clickable) */}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden hover:scale-105 transition-transform"
              >
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=1e3a8a&color=fff`} alt="User" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        
        {/* Banner CTA */}
        {activeTab !== 'supervisor' && activeTab !== 'community' && (
          <div className="mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 md:max-w-2xl">
              <div className="inline-block bg-green-500 text-blue-900 text-[10px] font-black uppercase px-3 py-1 rounded-full mb-4">
                Offre Parrainage 2026
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Gagnez <span className="text-green-400">150€ à 500€</span> par ami installé !
              </h1>
              <p className="text-blue-100 text-lg opacity-80 mb-8 max-w-lg">
                Faites profiter vos proches de l'expertise Free Energie. 3ème parrainage = Bonus de 500€ !
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsAddingReferral(true)}
                  className="bg-green-500 text-blue-900 px-10 py-4 rounded-2xl font-black hover:bg-green-400 transition-all flex items-center shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  PARRAINER MAINTENANT
                </button>
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="bg-blue-800/50 backdrop-blur text-white border border-white/20 px-8 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all flex items-center shadow-lg lg:hidden"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  VOIR VIDEO
                </button>
              </div>
            </div>

            {/* AI Pitch Sidebar */}
            <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-80">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-black uppercase text-green-400">Idée de message (IA)</span>
                   <button onClick={loadAiPitch} className="p-1 hover:bg-white/10 rounded">
                     <svg className={`w-4 h-4 text-white ${isLoadingPitch ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                   </button>
                </div>
                <p className="text-sm italic font-medium leading-relaxed opacity-90 mb-4">"{aiPitch}"</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiPitch);
                    alert("Copié !");
                  }}
                  className="w-full bg-white text-blue-900 text-[10px] font-black uppercase py-2 rounded-xl"
                >
                  Copier pour WhatsApp
                </button>
              </div>
            </div>
            {/* Decorations */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <Dashboard 
              user={user} 
              referrals={user.referrals.filter(r => r.sponsorId === user.id)} 
              onOpenSimulator={() => setShowSimulator(true)}
            />
            <TrackingTable referrals={user.referrals.filter(r => r.sponsorId === user.id)} />
          </div>
        )}

        {activeTab === 'referrals' && (
          <TrackingTable referrals={user.referrals.filter(r => r.sponsorId === user.id)} />
        )}

        {activeTab === 'catalog' && (
          <Catalog userTokens={user.tokens} onRedeem={handleRedeem} items={catalogItems} />
        )}

        {activeTab === 'community' && (
          <PartnerNetwork partners={partners} onAddPartner={handleAddPartner} currentUser={user} />
        )}

        {activeTab === 'supervisor' && (
          <SupervisorDashboard 
            allReferrals={user.referrals} 
            onUpdateStatus={handleUpdateStatus}
            catalogItems={catalogItems}
            onAddCatalogItem={handleAddCatalogItem}
            onUpdateCatalogItem={handleUpdateCatalogItem}
            onDeleteCatalogItem={handleDeleteCatalogItem}
            partners={partners}
            onUpdatePartnerStatus={handleUpdatePartnerStatus}
          />
        )}
      </main>

      {/* Modal Form */}
      {isAddingReferral && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
            <ReferralForm onAdd={handleAddReferral} onCancel={() => setIsAddingReferral(false)} />
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        <button onClick={() => handleTabChange('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-900' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
          <span className="text-[10px] font-black uppercase mt-1">Dash</span>
        </button>
        <button onClick={() => handleTabChange('community')} className={`flex flex-col items-center ${activeTab === 'community' ? 'text-blue-900' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] font-black uppercase mt-1">Club</span>
        </button>
        <button onClick={() => setIsAddingReferral(true)} className="bg-green-500 -mt-10 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-900 shadow-xl border-4 border-gray-50 active:scale-90 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={() => handleTabChange('catalog')} className={`flex flex-col items-center ${activeTab === 'catalog' ? 'text-blue-900' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="text-[10px] font-black uppercase mt-1">Cadeaux</span>
        </button>
        <button onClick={() => handleTabChange('supervisor')} className={`relative flex flex-col items-center ${activeTab === 'supervisor' ? 'text-blue-900' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-black uppercase mt-1">Admin</span>
          {unreadLeadsCount > 0 && !isAdminAuthenticated && <span className="absolute top-0 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>}
        </button>
      </footer>
    </div>
  );
};

export default App;
