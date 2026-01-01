
import React from 'react';
import { Referral, ReferralStatus } from '../types';

interface TrackingTableProps {
  referrals: Referral[];
}

const TrackingTable: React.FC<TrackingTableProps> = ({ referrals }) => {
  const getStatusStyle = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.NEW: return 'bg-gray-100 text-gray-600';
      case ReferralStatus.APPOINTMENT: return 'bg-amber-100 text-amber-700';
      case ReferralStatus.QUOTE: return 'bg-blue-100 text-blue-700';
      case ReferralStatus.INSTALLED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Create a map of IDs to their installation "rank" to determine value (1st, 2nd, 3rd...)
  const installedIds = referrals
    .filter(r => r.status === ReferralStatus.INSTALLED)
    .sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime())
    .map(r => r.id);

  const getRewardValue = (id: string) => {
    const index = installedIds.indexOf(id);
    if (index === -1) return 0;
    // index 0 -> 1st (150), index 1 -> 2nd (150), index 2 -> 3rd (500)
    return (index + 1) % 3 === 0 ? 500 : 150;
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h4 className="text-xl font-black text-blue-900">Mes Parrainages</h4>
          <p className="text-xs text-gray-400 font-medium">Suivez l'évolution de vos recommandations en temps réel.</p>
        </div>
        <div className="bg-blue-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
          {referrals.length} Dossiers
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-gray-50">
              <th className="px-8 py-5">Filleul</th>
              <th className="px-8 py-5">État du dossier</th>
              <th className="px-8 py-5">Date d'envoi</th>
              <th className="px-8 py-5 text-right">Prime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {referrals.map((ref) => {
               const reward = getRewardValue(ref.id);
               const isBonus = reward === 500;
               return (
                <tr key={ref.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-blue-900">{ref.name}</div>
                    <div className="text-xs text-gray-500 font-medium">{ref.address}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(ref.status)}`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-bold">
                    {new Date(ref.dateCreated).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {ref.status === ReferralStatus.INSTALLED ? (
                      <div className="flex flex-col items-end">
                        <span className={`${isBonus ? 'text-amber-500 text-lg' : 'text-green-600 text-sm'} font-black`}>
                          {reward}€ Gagnés {isBonus && '🏆'}
                        </span>
                        {isBonus && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded uppercase font-bold">Bonus Palier 3</span>}
                        {!isBonus && <span className="text-[10px] text-gray-400 font-bold uppercase">Débloqué</span>}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-[10px] font-black uppercase italic tracking-widest">En attente</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {referrals.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="max-w-xs mx-auto text-gray-300">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="font-black uppercase text-[10px] tracking-widest">Vous n'avez pas encore parrainé de proche</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackingTable;
