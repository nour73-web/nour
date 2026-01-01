
import React, { useState, useMemo } from 'react';
import { Referral, ReferralStatus, CatalogItem, Partner } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TOKEN_VALUE } from '../constants';

interface SupervisorDashboardProps {
  allReferrals: Referral[];
  onUpdateStatus: (id: string, newStatus: ReferralStatus) => void;
  catalogItems: CatalogItem[];
  onAddCatalogItem: (item: CatalogItem) => void;
  onUpdateCatalogItem?: (id: string, updates: Partial<CatalogItem>) => void;
  onDeleteCatalogItem: (id: string) => void;
  partners: Partner[];
  onUpdatePartnerStatus: (id: string, status: 'VALIDATED' | 'REJECTED') => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ 
  allReferrals, 
  onUpdateStatus,
  catalogItems,
  onAddCatalogItem,
  onUpdateCatalogItem,
  onDeleteCatalogItem,
  partners,
  onUpdatePartnerStatus
}) => {
  const [filter, setFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'catalog' | 'partners'>('overview');
  const [qrModalClient, setQrModalClient] = useState<Referral | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<CatalogItem>>({
    title: '', description: '', tokenCost: 1, euroValue: 150, category: 'EQUIPEMENT', image: ''
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(newItem.title && newItem.tokenCost) {
      onAddCatalogItem({
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description || '',
        tokenCost: newItem.tokenCost,
        euroValue: newItem.euroValue || newItem.tokenCost * TOKEN_VALUE,
        category: newItem.category as any,
        image: newItem.image || 'https://images.unsplash.com/photo-1513828583688-c29537deb8c2?auto=format&fit=crop&q=80&w=400'
      });
      setNewItem({ title: '', description: '', tokenCost: 1, euroValue: 150, category: 'EQUIPEMENT', image: '' });
    }
  };

  const pendingPartners = partners.filter(p => p.status === 'PENDING');

  const stats = useMemo(() => [
    { name: 'Nouveaux', value: allReferrals.filter(r => r.status === ReferralStatus.NEW).length, color: '#94a3b8' },
    { name: 'Rendez-vous', value: allReferrals.filter(r => r.status === ReferralStatus.APPOINTMENT).length, color: '#fbbf24' },
    { name: 'Devis', value: allReferrals.filter(r => r.status === ReferralStatus.QUOTE).length, color: '#3b82f6' },
    { name: 'Installés', value: allReferrals.filter(r => r.status === ReferralStatus.INSTALLED).length, color: '#22c55e' },
  ], [allReferrals]);

  interface SponsorData {
    name: string;
    totalLeads: number;
    installedCount: number;
    earnings: number;
  }

  // Calculate earnings considering the 150/150/500 cycle
  const sponsorPerformance = useMemo(() => {
    const map = allReferrals.reduce((acc, referral) => {
      const name = referral.sponsorName;
      if (!acc[name]) {
        acc[name] = { name, totalLeads: 0, installedCount: 0, earnings: 0, installedDates: [] as number[] };
      }
      acc[name].totalLeads += 1;
      if (referral.status === ReferralStatus.INSTALLED) {
        acc[name].installedCount += 1;
        acc[name].installedDates.push(new Date(referral.dateCreated).getTime());
      }
      return acc;
    }, {} as Record<string, SponsorData & { installedDates: number[] }>);

    // Process earnings per sponsor based on sorted dates
    Object.values(map).forEach((sponsor: SponsorData & { installedDates: number[] }) => {
      sponsor.installedDates.sort((a, b) => a - b);
      let money = 0;
      sponsor.installedDates.forEach((_, index) => {
        // index 0 (1st) -> 150, index 1 (2nd) -> 150, index 2 (3rd) -> 500
        if ((index + 1) % 3 === 0) {
          money += 500;
        } else {
          money += 150;
        }
      });
      sponsor.earnings = money;
    });

    return (Object.values(map) as SponsorData[]).sort((a, b) => b.earnings - a.earnings);
  }, [allReferrals]);

  const filteredLeads = useMemo(() => {
    return allReferrals.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) || 
                           r.sponsorName.toLowerCase().includes(filter.toLowerCase()) ||
                           r.address.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = statusFilter === '' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allReferrals, filter, statusFilter]);

  const handleExport = () => {
    const headers = "Nom,Sponsor,Status,Date,Contact\n";
    const csv = allReferrals.map(r => `"${r.name}","${r.sponsorName}","${r.status}","${r.dateCreated}","${r.phone}"`).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_freeenergie_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleShareQR = (method: 'whatsapp' | 'sms', client: Referral) => {
    const text = `Bonjour ${client.name}, voici votre QR Code personnel pour parrainer vos proches sur Free Energie : https://free-energie.app/ref/${client.id}`;
    if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    else window.open(`sms:?body=${encodeURIComponent(text)}`, '_self');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* QR Code Modal for specific Client */}
      {qrModalClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setQrModalClient(null)} className="absolute top-4 right-4 text-gray-400 hover:text-blue-900">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center">
              <div className="inline-block bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                Code Parrainage Unique
              </div>
              <h3 className="text-xl font-black text-blue-900 mb-1">{qrModalClient.name}</h3>
              <p className="text-gray-400 text-xs mb-6 font-medium">À faire scanner par le client</p>
              
              <div className="bg-white p-2 rounded-xl mb-6 shadow-lg inline-block border border-gray-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://free-energie.app/ref/${qrModalClient.id}&color=1e3a8a`} 
                  alt="QR Code" 
                  className="w-48 h-48 rounded-lg mix-blend-multiply" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => handleShareQR('whatsapp', qrModalClient)} className="bg-green-500 hover:bg-green-400 text-blue-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center">
                   <span className="mr-1">📱</span> WhatsApp
                 </button>
                 <button onClick={() => handleShareQR('sms', qrModalClient)} className="bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center">
                   <span className="mr-1">💬</span> SMS
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 leading-tight">Portail Superviseur</h2>
          <p className="text-gray-500 font-medium">Pilotage réseau et gestion.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="https://calendar.app.google/N5JENFfZpFR2x1aF7"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-blue-900 px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Agenda
          </a>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'overview' ? 'bg-blue-900 text-white' : 'text-gray-400 hover:text-blue-900'}`}
            >
              Vue d'ensemble
            </button>
            <button 
              onClick={() => setActiveSubTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'catalog' ? 'bg-blue-900 text-white' : 'text-gray-400 hover:text-blue-900'}`}
            >
              Boutique
            </button>
            <button 
              onClick={() => setActiveSubTab('partners')}
              className={`relative px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'partners' ? 'bg-blue-900 text-white' : 'text-gray-400 hover:text-blue-900'}`}
            >
              Partenaires
              {pendingPartners.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3 bg-red-500 rounded-full border border-white"></span>}
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-black text-blue-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Pipeline Commercial Global</h3>
            <div className="flex-1 h-64 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                    {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sponsor Performance Section with Fiscal Alert */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-[0.2em]">Performance & Fiscalité (Seuil DAS2 > 1200€)</h3>
              <button onClick={handleExport} className="text-[10px] font-black uppercase tracking-widest text-blue-900 hover:underline">Exporter CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-50">
                    <th className="pb-4 px-2">Parrain</th>
                    <th className="pb-4 px-2 text-center">Leads</th>
                    <th className="pb-4 px-2 text-center">Installés</th>
                    <th className="pb-4 px-2 text-right">Gains Cumulés</th>
                    <th className="pb-4 px-2 text-center">Alerte DAS2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sponsorPerformance.map((sponsor, idx) => {
                    const das2Alert = sponsor.earnings > 1200;
                    return (
                    <tr key={idx} className={`hover:bg-blue-50/30 transition-colors group ${das2Alert ? 'bg-red-50/50' : ''}`}>
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-black text-[10px] mr-3">
                            {sponsor.name.charAt(0)}
                          </div>
                          <span className="font-black text-blue-900 text-sm">{sponsor.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center"><span className="text-sm font-bold text-gray-500">{sponsor.totalLeads}</span></td>
                      <td className="py-4 px-2 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-green-50 text-green-700 text-xs font-black">{sponsor.installedCount}</span></td>
                      <td className="py-4 px-2 text-right"><div className={`font-black text-sm ${das2Alert ? 'text-red-600' : 'text-blue-900'}`}>{sponsor.earnings}€</div></td>
                      <td className="py-4 px-2 text-center">
                        {das2Alert && (
                           <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-200">
                             À DÉCLARER
                           </span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leads Management Table */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:col-span-3">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-[0.2em]">Flux de Leads & Statuts</h3>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-48 pl-4 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-green-500 appearance-none text-blue-900 cursor-pointer shadow-sm">
                    <option value="">Tous les statuts</option>
                    {Object.values(ReferralStatus).map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div className="relative flex-1 sm:w-80">
                  <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-5 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 shadow-sm" value={filter} onChange={(e) => setFilter(e.target.value)}/>
                  <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-50">
                    <th className="pb-4 px-2">Contact</th>
                    <th className="pb-4 px-2">Sponsor</th>
                    <th className="pb-4 px-2">Statut</th>
                    <th className="pb-4 px-2 text-right">Action</th>
                    <th className="pb-4 px-2 text-center">QR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-2">
                        <div className="font-black text-blue-900">{lead.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold flex items-center uppercase mt-0.5">{lead.address}</div>
                      </td>
                      <td className="py-5 px-2"><div className="text-xs font-bold text-gray-600">{lead.sponsorName}</div></td>
                      <td className="py-5 px-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${lead.status === ReferralStatus.INSTALLED ? 'bg-green-100 text-green-700' : lead.status === ReferralStatus.NEW ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>{lead.status}</span>
                      </td>
                      <td className="py-5 px-2 text-right">
                        <select className="text-[10px] font-black uppercase tracking-widest bg-gray-100 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none text-blue-900 shadow-sm" value={lead.status} onChange={(e) => onUpdateStatus(lead.id, e.target.value as ReferralStatus)}>
                          {Object.values(ReferralStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="py-5 px-2 text-center">
                        <button 
                           onClick={() => setQrModalClient(lead)}
                           className="bg-blue-900 text-white p-2 rounded-lg hover:bg-green-500 hover:text-blue-900 transition-colors"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 8v4h4V8H6zM6 20v-4h4v4H6zM18 8v4h4V8h-4z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
            <h3 className="font-black text-blue-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Ajouter un Produit</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
               <input placeholder="Titre du cadeau" required className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Coût (Jetons)</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" value={newItem.tokenCost} onChange={e => setNewItem({...newItem, tokenCost: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Valeur (€)</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" value={newItem.euroValue} onChange={e => setNewItem({...newItem, euroValue: Number(e.target.value)})} />
                  </div>
               </div>
               
               <select className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                 <option value="EQUIPEMENT">Equipement</option>
                 <option value="LOISIR">Loisir</option>
                 <option value="ENTRETIEN">Entretien</option>
                 <option value="ACCESSOIRE">Accessoire</option>
                 <option value="CARTE CADEAU">Carte Cadeau</option>
               </select>
               <textarea placeholder="Description" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold h-24" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
               <input placeholder="URL Image" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />
               <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-colors">Ajouter au Catalogue</button>
            </form>
          </div>

          {/* Product List */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-black text-blue-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Catalogue Actuel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catalogItems.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative group">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover bg-white" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-blue-900 text-sm">{item.title}</h4>
                      <button onClick={() => onDeleteCatalogItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      {/* Token Cost Input */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-0.5 w-20">
                        <span className="text-[10px] text-gray-500 font-bold">J:</span>
                        <input 
                           type="number"
                           className="w-full text-[10px] font-black text-blue-900 border-none p-0 focus:ring-0 bg-transparent text-right"
                           value={item.tokenCost}
                           onChange={(e) => onUpdateCatalogItem && onUpdateCatalogItem(item.id, { tokenCost: Number(e.target.value) })}
                        />
                      </div>
                      
                      {/* Euro Value Input */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-0.5 w-24">
                        <span className="text-[10px] text-gray-500 font-bold">€:</span>
                        <input 
                           type="number"
                           className="w-full text-[10px] font-black text-green-600 border-none p-0 focus:ring-0 bg-transparent text-right"
                           value={item.euroValue ?? (item.tokenCost * TOKEN_VALUE)}
                           onChange={(e) => onUpdateCatalogItem && onUpdateCatalogItem(item.id, { euroValue: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'partners' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="font-black text-blue-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Validation Partenaires ({pendingPartners.length} en attente)</h3>
           {pendingPartners.length === 0 ? (
             <p className="text-gray-400 text-sm">Aucune demande de partenariat en attente.</p>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pendingPartners.map(p => (
                 <div key={p.id} className="border border-amber-200 bg-amber-50/50 rounded-2xl p-6 flex gap-4">
                    <img src={p.image} alt={p.companyName} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                       <h4 className="font-black text-blue-900">{p.companyName}</h4>
                       <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">{p.category} • {p.department}</p>
                       <p className="text-sm text-gray-700 mb-4">{p.offerDescription}</p>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => onUpdatePartnerStatus(p.id, 'VALIDATED')}
                            className="bg-green-500 text-blue-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-green-400"
                          >
                            Valider
                          </button>
                          <button 
                            onClick={() => onUpdatePartnerStatus(p.id, 'REJECTED')}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-200"
                          >
                            Refuser
                          </button>
                       </div>
                       <p className="text-[9px] text-gray-400 mt-2">Proposé par {p.sponsorName}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}

           <h3 className="font-black text-blue-900 mt-12 mb-6 uppercase text-[10px] tracking-[0.2em]">Historique Partenaires</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                 <tr>
                   <th className="py-2">Société</th>
                   <th className="py-2">Parrain</th>
                   <th className="py-2">Statut</th>
                   <th className="py-2 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                 {partners.filter(p => p.status !== 'PENDING').map(p => (
                   <tr key={p.id} className="group hover:bg-gray-50">
                     <td className="py-3 font-bold text-blue-900">{p.companyName}</td>
                     <td className="py-3 text-gray-500 text-xs">{p.sponsorName}</td>
                     <td className="py-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${p.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {p.status}
                       </span>
                     </td>
                     <td className="py-3 text-right">
                       {p.status === 'REJECTED' && (
                         <button onClick={() => onUpdatePartnerStatus(p.id, 'VALIDATED')} className="text-blue-900 text-[10px] font-black uppercase underline hover:text-green-500">Réactiver</button>
                       )}
                       {p.status === 'VALIDATED' && (
                          <button onClick={() => onUpdatePartnerStatus(p.id, 'REJECTED')} className="text-red-400 text-[10px] font-black uppercase underline hover:text-red-600">Désactiver</button>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
