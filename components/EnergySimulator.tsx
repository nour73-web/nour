
import React, { useState, useMemo } from 'react';

interface EnergySimulatorProps {
  onClose: () => void;
}

type EnergyType = 'ELEC' | 'GAZ' | 'FIOUL';

const EnergySimulator: React.FC<EnergySimulatorProps> = ({ onClose }) => {
  const [energyType, setEnergyType] = useState<EnergyType>('ELEC');
  const [bill, setBill] = useState<number>(150);
  
  // Configuration per energy type
  const config = useMemo(() => {
    switch (energyType) {
      case 'ELEC':
        return {
          label: "Électricité",
          inflation: 0.07, // 7%
          savingsRate: 0.90, // 90% savings (Consumption eliminated, only subscription remains)
          unit: "€ / mois",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          )
        };
      case 'GAZ':
        return {
          label: "Gaz",
          inflation: 0.10, // 10%
          savingsRate: 0.70, // Higher savings when switching from Gas to Heat Pump + Solar
          unit: "€ / mois",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
          )
        };
      case 'FIOUL':
        return {
          label: "Fioul",
          inflation: 0.10, // 10%
          savingsRate: 0.70, // High savings replacing expensive fuel
          unit: "€ / mois (lissé)",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          )
        };
    }
  }, [energyType]);

  const calculation = useMemo(() => {
    const currentYearlyBill = bill * 12;
    const currentYearSavings = Math.round(currentYearlyBill * config.savingsRate);
    
    // Calculate 10-year cumulative savings with compound inflation
    let totalTenYearSavings = 0;
    let projectedBill = currentYearlyBill;

    for (let i = 0; i < 10; i++) {
      // Calculate savings for this specific year
      const savingsThisYear = projectedBill * config.savingsRate;
      totalTenYearSavings += savingsThisYear;
      
      // Increase the bill for the next year calculation based on inflation
      projectedBill = projectedBill * (1 + config.inflation);
    }

    return {
      currentYearSavings,
      totalTenYearSavings: Math.round(totalTenYearSavings)
    };
  }, [bill, config]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-xl font-black uppercase tracking-widest relative z-10">Simulateur Free Energie</h3>
          <p className="text-blue-200 text-xs font-medium mt-1 relative z-10">Montrez les économies à vos proches</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-blue-200 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Energy Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
            {(['ELEC', 'GAZ', 'FIOUL'] as EnergyType[]).map((type) => (
              <button
                key={type}
                onClick={() => setEnergyType(type)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  energyType === type 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {type === 'ELEC' ? 'Électricité' : type === 'GAZ' ? 'Gaz' : 'Fioul'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              {config.icon} Facture {config.label} actuelle
            </label>
            <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <span className="text-xl font-black text-blue-900 mr-2">€</span>
              <input 
                type="number" 
                value={bill} 
                onChange={(e) => setBill(Number(e.target.value))}
                className="bg-transparent border-none text-xl font-black text-blue-900 focus:ring-0 w-full"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">/ mois</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="800" 
              step="10" 
              value={bill} 
              onChange={(e) => setBill(Number(e.target.value))}
              className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-20"></div>
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Économies Estimées / An (Actuel)</p>
            <div className="text-4xl font-black text-blue-900 mb-1">{calculation.currentYearSavings} €</div>
            <p className="text-xs text-gray-500 font-medium leading-snug mt-3">
              Sur 10 ans (avec inflation <strong>{config.inflation * 100}%</strong>) : <br/>
              <span className="text-green-600 font-black text-lg">{calculation.totalTenYearSavings.toLocaleString()} €</span> économisés !
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              {energyType === 'ELEC' 
                ? "Avec le système C.P.E.I. (Centrale de Production Électrique Individuelle), il ne vous reste plus que vos abonnements à payer."
                : `En remplaçant votre système ${config.label} par une solution d'autonomie MyLight (Solaire + PAC), vous sécurisez votre avenir.`
              }
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-blue-900 transition-colors shadow-lg"
            >
              C'est noté, je parraine !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergySimulator;
