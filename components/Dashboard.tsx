
import React from 'react';
import { Referral, ReferralStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TOKEN_VALUE } from '../constants';

interface DashboardProps {
  user: { name: string; tokens: number; id: string; networkInstallCount: number };
  referrals: Referral[];
  onOpenSimulator: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, referrals, onOpenSimulator }) => {
  const chartData = [
    { name: 'Nouveaux', count: referrals.filter(r => r.status === ReferralStatus.NEW).length, color: '#94a3b8' },
    { name: 'Rendez-vous', count: referrals.filter(r => r.status === ReferralStatus.APPOINTMENT).length, color: '#fbbf24' },
    { name: 'Devis', count: referrals.filter(r => r.status === ReferralStatus.QUOTE).length, color: '#3b82f6' },
    { name: 'Installés', count: referrals.filter(r => r.status === ReferralStatus.INSTALLED).length, color: '#22c55e' },
  ];

  // Logic Calculations
  const directInstalls = referrals.filter(r => r.status === ReferralStatus.INSTALLED).length;
  const networkInstalls = user.networkInstallCount || 0;
  const totalVolume = directInstalls + networkInstalls; // Combined volume determines rank
  const userBalanceEuro = user.tokens * TOKEN_VALUE;

  // --- MULTI-LEVEL RANK SYSTEM CONFIGURATION ---
  // Structure similar to Herbalife: Status depends on Total Volume (Direct + Indirect)
  
  interface RankTier {
    name: string;
    tier: 'Bronze' | 'Argent' | 'Or';
    threshold: number;
    color: string;
    benefits: string[];
  }

  const RANK_SYSTEM: RankTier[] = [
    // JUNIOR
    { name: "Junior", tier: "Bronze", threshold: 0, color: "bg-gray-400", benefits: ["Accès App", "Simulateur"] },
    { name: "Junior", tier: "Argent", threshold: 1, color: "bg-gray-500", benefits: ["Accès App", "Simulateur"] },
    { name: "Junior", tier: "Or", threshold: 2, color: "bg-gray-600", benefits: ["Accès App", "Simulateur", "Accès Club"] },
    
    // INITIÉ
    { name: "Initié", tier: "Bronze", threshold: 3, color: "bg-blue-400", benefits: ["Gains 150€/parrainage", "Club Partenaires"] },
    { name: "Initié", tier: "Argent", threshold: 5, color: "bg-blue-500", benefits: ["Gains 150€/parrainage", "Club Partenaires"] },
    { name: "Initié", tier: "Or", threshold: 7, color: "bg-blue-600", benefits: ["Gains 150€/parrainage", "Invitations Soirées"] },

    // EXPERT
    { name: "Expert", tier: "Bronze", threshold: 10, color: "bg-amber-400", benefits: ["Bonus Palier 500€", "Badge Expert"] },
    { name: "Expert", tier: "Argent", threshold: 15, color: "bg-amber-500", benefits: ["Bonus Palier 500€", "Badge Expert"] },
    { name: "Expert", tier: "Or", threshold: 20, color: "bg-amber-600", benefits: ["Bonus Palier 500€", "Billets Match Foot/Basket VIP"] },

    // AMBASSADEUR
    { name: "Ambassadeur", tier: "Bronze", threshold: 30, color: "bg-yellow-500", benefits: ["Entretien Offert", "Ligne Prioritaire"] },
    { name: "Ambassadeur", tier: "Argent", threshold: 50, color: "bg-yellow-600", benefits: ["Entretien Offert", "Accès Loges VIP"] },
    { name: "Ambassadeur", tier: "Or", threshold: 75, color: "bg-yellow-700", benefits: ["Statut Ultime", "Voyages Privés", "Cadeaux Exclusifs"] },
  ];

  // Determine Current Rank
  let currentRankIndex = 0;
  for (let i = RANK_SYSTEM.length - 1; i >= 0; i--) {
    if (totalVolume >= RANK_SYSTEM[i].threshold) {
      currentRankIndex = i;
      break;
    }
  }
  const currentRank = RANK_SYSTEM[currentRankIndex];
  const nextRank = RANK_SYSTEM[currentRankIndex + 1];
  
  // Progress to next rank
  let progressToNextRank = 100;
  let installsNeeded = 0;
  
  if (nextRank) {
    const range = nextRank.threshold - currentRank.threshold;
    const currentProgress = totalVolume - currentRank.threshold;
    progressToNextRank = (currentProgress / range) * 100;
    installsNeeded = nextRank.threshold - totalVolume;
  }

  // Bonus Cycle Logic (Direct installs only for cash bonus, but rank is total volume)
  let currentEarnings = 0;
  for (let i = 1; i <= directInstalls; i++) {
    if (i % 3 === 0) currentEarnings += 500;
    else currentEarnings += 150;
  }
  const nextBonusProgress = directInstalls % 3;
  const stepsToBonus = 3 - nextBonusProgress;

  // QR Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://free-energie.app/ref/${user.id}&color=1e3a8a`;

  const handleShare = (method: 'whatsapp' | 'sms') => {
    const text = `Salut ! Rejoins mon équipe Free Energie. En plus des économies, tu peux gagner de l'argent en parrainant à ton tour ! Lien : https://free-energie.app/ref/${user.id}`;
    if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    else window.open(`sms:?body=${encodeURIComponent(text)}`, '_self');
  };

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'Or': return 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-200';
      case 'Argent': return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-800 border-slate-300';
      default: return 'bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900 border-orange-300';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      
      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-black text-blue-900">Bonjour, {user.name.split(' ')[0]} 👋</h2>
          
          {/* Rank Progress Bar */}
          <div className="mt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-md relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
              <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg border flex items-center gap-2 ${getTierBadgeColor(currentRank.tier)}`}>
                 <span className="text-lg">
                   {currentRank.tier === 'Or' ? '🥇' : currentRank.tier === 'Argent' ? '🥈' : '🥉'}
                 </span>
                 {currentRank.name} {currentRank.tier}
              </div>
              {nextRank && (
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide block">
                    Prochain Niveau
                  </span>
                  <span className="text-[10px] text-blue-900 font-black uppercase">
                     {nextRank.name} {nextRank.tier}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-[9px] text-gray-400 font-bold mb-1 uppercase tracking-widest">
               <span>Volume Actuel: {totalVolume}</span>
               <span>Objectif: {nextRank ? nextRank.threshold : 'MAX'}</span>
            </div>

            {nextRank ? (
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 bg-gradient-to-r ${currentRank.tier === 'Or' ? 'from-yellow-400 to-yellow-600' : 'from-blue-400 to-blue-600'}`}
                  style={{ width: `${progressToNextRank}%` }}
                ></div>
              </div>
            ) : (
              <div className="text-[10px] text-amber-500 font-black uppercase tracking-widest text-center w-full">
                👑 Statut Légende Atteint 👑
              </div>
            )}
            
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -z-0 opacity-50"></div>
          </div>
        </div>

        <button 
          onClick={onOpenSimulator}
          className="bg-white border-2 border-green-500 text-blue-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-colors flex items-center shadow-sm w-full md:w-auto justify-center"
        >
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Simulateur d'Économies
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Network Performance Card (New for MLM Logic) */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
           
           <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-blue-900 shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Mon Réseau</span>
             </div>
             
             <div className="flex justify-between items-end mb-2">
               <div>
                 <span className="text-4xl font-black">{totalVolume}</span>
                 <span className="text-xs ml-2 opacity-70">Installations Totales</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-white/10 rounded-xl p-3">
                   <p className="text-[9px] font-bold uppercase opacity-60">Directs</p>
                   <p className="text-xl font-black">{directInstalls}</p>
                </div>
                <div className="bg-green-500/20 rounded-xl p-3 border border-green-500/30">
                   <p className="text-[9px] font-bold uppercase text-green-300">Réseau (Filleuls)</p>
                   <p className="text-xl font-black text-green-400">+{networkInstalls}</p>
                </div>
             </div>
           </div>

           <p className="text-[10px] mt-4 opacity-60 font-medium border-t border-white/10 pt-3">
             Chaque parrainage réalisé par vos filleuls augmente votre rang et débloque des privilèges VIP.
           </p>
        </div>

        {/* Share / Viral Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden justify-center">
           <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -ml-10 -mt-10 opacity-50"></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 relative z-10">Mon lien de recrutement</p>
           
           <div className="bg-white p-2 rounded-xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300 border border-gray-50">
             <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded-lg mix-blend-multiply" />
           </div>

           <div className="flex gap-3 w-full relative z-10">
             <button onClick={() => handleShare('whatsapp')} className="flex-1 bg-green-500 hover:bg-green-400 text-blue-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center shadow-lg shadow-green-200">
               WhatsApp
             </button>
             <button onClick={() => handleShare('sms')} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center shadow-lg shadow-blue-200">
               SMS
             </button>
           </div>
        </div>

        {/* Bonus Progress */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center text-center relative overflow-hidden">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Prochain Bonus Cash Direct</p>
           {stepsToBonus === 3 ? (
             <div className="relative z-10">
               <h3 className="text-2xl font-black text-blue-900 leading-tight">Cycle terminé ! 🎯</h3>
               <p className="text-xs text-gray-500 mt-1">+500€ débloqués !</p>
             </div>
           ) : (
             <div className="relative z-10">
                <div className="text-4xl font-black text-amber-500 mb-1">{stepsToBonus}</div>
                <p className="text-xs font-bold text-blue-900 leading-tight">Parrainage{stepsToBonus > 1 ? 's' : ''} directs avant<br/>le bonus de 500€</p>
             </div>
           )}
           <div className="mt-4 flex justify-center gap-1 relative z-10">
              <div className={`h-1.5 w-8 rounded-full ${nextBonusProgress >= 1 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
              <div className={`h-1.5 w-8 rounded-full ${nextBonusProgress >= 2 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
              <div className={`h-1.5 w-8 rounded-full ${nextBonusProgress >= 3 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
           </div>
        </div>
      </div>

      {/* Exclusive Benefits Section (Updated with VIP Events) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-8 py-6 border-b border-gray-50 bg-gradient-to-r from-gray-900 to-blue-900">
            <h3 className="text-white font-black text-lg flex items-center">
              <span className="mr-2">💎</span> Avantages & Privilèges
            </h3>
            <p className="text-blue-200 text-xs">Débloqués grâce à votre statut {currentRank.name} {currentRank.tier}</p>
         </div>
         <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Show benefits of current rank and below */}
            {RANK_SYSTEM.filter(r => r.threshold <= currentRank.threshold).flatMap(r => r.benefits).filter((v, i, a) => a.indexOf(v) === i).map((benefit, idx) => {
              const isEvent = benefit.includes("Match") || benefit.includes("Loges") || benefit.includes("Soirées");
              const isBonus = benefit.includes("Bonus");
              
              return (
                <div key={idx} className={`flex items-center p-4 rounded-2xl border transition-all hover:scale-105 ${isEvent ? 'bg-purple-50 border-purple-200' : isBonus ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${isEvent ? 'bg-purple-100 text-purple-600' : isBonus ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {isEvent ? (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isEvent ? 'text-purple-800' : isBonus ? 'text-amber-800' : 'text-gray-600'}`}>{benefit}</span>
                </div>
              );
            })}
            
            {/* Show locked benefits of next rank */}
            {nextRank && nextRank.benefits.filter(b => !currentRank.benefits.includes(b)).map((benefit, idx) => (
               <div key={`locked-${idx}`} className="flex items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-100 opacity-60 grayscale hover:grayscale-0 transition-all">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-200 text-gray-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 </div>
                 <span className="text-xs font-bold text-gray-400">{benefit}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
           <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em]">Performance Directe</h4>
           <div className="flex gap-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{d.name}</span>
                </div>
              ))}
           </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              />
              <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
