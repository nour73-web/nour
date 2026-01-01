
import React, { useState } from 'react';
import { Partner } from '../types';

interface PartnerNetworkProps {
  partners: Partner[];
  onAddPartner: (partner: Partner) => void;
  currentUser: { name: string; id: string };
}

const PartnerNetwork: React.FC<PartnerNetworkProps> = ({ partners, onAddPartner, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'COMMUNITY' | 'MY_ADS'>('COMMUNITY');
  const [filterDept, setFilterDept] = useState<'ALL' | '73' | '74'>('ALL');
  
  const [newPartner, setNewPartner] = useState({
    companyName: '',
    category: '',
    offerDescription: '',
    department: '74',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPartner({
      id: Date.now().toString(),
      companyName: newPartner.companyName,
      category: newPartner.category,
      offerDescription: newPartner.offerDescription,
      department: newPartner.department as '73'|'74'|'AUTRE',
      image: newPartner.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
      sponsorId: currentUser.id,
      sponsorName: currentUser.name,
      status: 'PENDING'
    });
    setShowForm(false);
    setNewPartner({ companyName: '', category: '', offerDescription: '', department: '74', image: '' });
    setActiveTab('MY_ADS'); // Switch to my ads to see the pending one
  };

  // Only show validated partners in the community tab
  const communityPartners = partners.filter(p => 
    p.status === 'VALIDATED' && (filterDept === 'ALL' || p.department === filterDept)
  );

  // Show all my partners regardless of status
  const myPartners = partners.filter(p => p.sponsorId === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'VALIDATED': return <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">Validé</span>;
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">En attente</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">Refusé</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 leading-tight">Communauté Free Energie</h2>
          <p className="text-gray-500 font-medium">Échanges et avantages entre parrains (Savoie & Haute-Savoie).</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-400 shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Proposer ma Société
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-green-500/20 animate-in slide-in-from-top-5">
          <h3 className="font-black text-blue-900 mb-6 uppercase text-sm tracking-widest">Ajouter un Partenaire</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              required placeholder="Nom de la société" 
              className="px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              value={newPartner.companyName} onChange={e => setNewPartner({...newPartner, companyName: e.target.value})}
            />
            <input 
              required placeholder="Secteur (ex: Beauté, Auto...)" 
              className="px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              value={newPartner.category} onChange={e => setNewPartner({...newPartner, category: e.target.value})}
            />
            <textarea 
              required placeholder="Description de l'offre spéciale (ex: -20% sur présentation de l'app)" 
              className="md:col-span-2 px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm h-24"
              value={newPartner.offerDescription} onChange={e => setNewPartner({...newPartner, offerDescription: e.target.value})}
            />
            <select 
              className="px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              value={newPartner.department} onChange={e => setNewPartner({...newPartner, department: e.target.value})}
            >
              <option value="73">73 - Savoie</option>
              <option value="74">74 - Haute-Savoie</option>
              <option value="AUTRE">Autre</option>
            </select>
            <input 
              placeholder="URL Image (Optionnel)" 
              className="px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              value={newPartner.image} onChange={e => setNewPartner({...newPartner, image: e.target.value})}
            />
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-blue-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-800">
                Soumettre pour validation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('COMMUNITY')}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'COMMUNITY' ? 'text-blue-900 border-b-2 border-green-500' : 'text-gray-400'}`}
        >
          Les Offres
        </button>
        <button 
          onClick={() => setActiveTab('MY_ADS')}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'MY_ADS' ? 'text-blue-900 border-b-2 border-green-500' : 'text-gray-400'}`}
        >
          Mes Partenaires ({myPartners.length})
        </button>
      </div>

      {activeTab === 'COMMUNITY' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 mt-6 mb-6">
            <button onClick={() => setFilterDept('ALL')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterDept === 'ALL' ? 'bg-blue-900 text-white' : 'bg-white text-gray-400'}`}>Tous</button>
            <button onClick={() => setFilterDept('73')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterDept === '73' ? 'bg-blue-900 text-white' : 'bg-white text-gray-400'}`}>73 - Savoie</button>
            <button onClick={() => setFilterDept('74')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterDept === '74' ? 'bg-blue-900 text-white' : 'bg-white text-gray-400'}`}>74 - Haute-Savoie</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPartners.map(partner => (
              <div key={partner.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                <div className="h-40 bg-gray-100 relative">
                  <img src={partner.image} alt={partner.companyName} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-blue-900">
                    {partner.department}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-black text-blue-900">{partner.companyName}</h3>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{partner.category}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl mb-4 border border-green-100">
                    <p className="text-sm font-bold text-green-800 flex items-start">
                      <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                      {partner.offerDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-medium">Proposé par <span className="font-bold text-blue-900">{partner.sponsorName}</span></span>
                    <button className="text-blue-900 font-black uppercase hover:text-green-500 transition-colors">Voir contact →</button>
                  </div>
                </div>
              </div>
            ))}
            {communityPartners.length === 0 && (
              <div className="col-span-3 text-center py-10 text-gray-400 text-sm">
                Aucun partenaire validé pour le moment dans cette catégorie.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'MY_ADS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {myPartners.map(partner => (
            <div key={partner.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 relative opacity-90 hover:opacity-100 transition-opacity">
               <div className="absolute top-4 left-4 z-10">
                  {getStatusBadge(partner.status)}
               </div>
               <div className="h-32 bg-gray-100 relative">
                  <img src={partner.image} alt={partner.companyName} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all" />
               </div>
               <div className="p-6">
                 <h3 className="text-lg font-black text-blue-900 mb-1">{partner.companyName}</h3>
                 <p className="text-xs text-gray-500 mb-2">{partner.offerDescription}</p>
                 <div className="text-[10px] text-gray-400">
                    Statut: <span className="font-bold">{partner.status === 'PENDING' ? 'En attente de validation' : partner.status === 'VALIDATED' ? 'Visible par la communauté' : 'Refusé par l\'admin'}</span>
                 </div>
               </div>
            </div>
          ))}
          {myPartners.length === 0 && (
             <div className="col-span-3 text-center py-10">
               <p className="text-gray-400 text-sm mb-4">Vous n'avez pas encore proposé de partenaire.</p>
               <button onClick={() => setShowForm(true)} className="text-blue-900 font-black underline">Proposer ma première société</button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerNetwork;
