
import React from 'react';
import { CatalogItem } from '../types';
import { TOKEN_VALUE } from '../constants';

interface CatalogProps {
  userTokens: number;
  onRedeem: (item: any) => void;
  items: CatalogItem[];
}

const Catalog: React.FC<CatalogProps> = ({ userTokens, onRedeem, items }) => {
  const userBalanceEuro = userTokens * TOKEN_VALUE;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-block bg-blue-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm mb-2 tracking-widest">
            Boutique Fidélité
          </div>
          <h2 className="text-4xl font-black text-blue-900">Catalogue Free Energie</h2>
          <p className="text-gray-500 mt-2 max-w-lg">Profitez de vos succès de parrainage pour équiper votre maison ou entretenir vos installations gratuitement.</p>
        </div>
        <div className="bg-white border-2 border-green-500 px-8 py-4 rounded-3xl flex items-center shadow-lg transform hover:scale-105 transition-transform">
          <div className="mr-4 text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">Crédit Dispo</span>
            <span className="text-3xl font-black text-blue-900">{userBalanceEuro} €</span>
          </div>
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black italic shadow-inner">
            €
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map((item) => {
          // Use custom euroValue if defined, otherwise calculate based on tokens
          const itemCostEuro = item.euroValue ?? (item.tokenCost * TOKEN_VALUE);
          const canAfford = userTokens >= item.tokenCost;
          
          return (
            <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
              <div className="relative h-64 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                   <span className="text-white font-black text-xs uppercase tracking-widest">Voir détails</span>
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                   </div>
                </div>
                <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-2xl shadow-xl border border-gray-100 text-blue-900 font-black text-sm z-20">
                  {itemCostEuro} €
                </div>
              </div>
              <div className="p-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-3 block">{item.category}</span>
                <h3 className="text-2xl font-black text-blue-900 mb-3 group-hover:text-green-600 transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-400 uppercase">
                     Coût: <span className="text-blue-900 text-sm">{item.tokenCost} Jeton{item.tokenCost > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    disabled={!canAfford}
                    onClick={() => onRedeem(item)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      canAfford 
                        ? 'bg-blue-900 text-white hover:bg-green-500 hover:text-blue-900 shadow-lg' 
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Commander' : 'Insuffisant'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Catalog;
