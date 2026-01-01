
import React, { useState } from 'react';
import { ReferralStatus } from '../types';

interface ReferralFormProps {
  onAdd: (referral: any) => void;
  onCancel: () => void;
}

const ReferralForm: React.FC<ReferralFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [eligibility, setEligibility] = useState({
    isHomeowner: false,
    houseOver2Years: false
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form is valid only if eligibility criteria are met
  const isEligible = eligibility.isHomeowner && eligibility.houseOver2Years;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !acceptTerms || !isEligible) return;

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: ReferralStatus.NEW,
      dateCreated: new Date().toISOString().split('T')[0],
      tokensAwarded: false,
      isHomeowner: true,
      houseOver2Years: true
    });
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-blue-900 mb-2">Nouveau Contact</h2>
          <p className="text-gray-500 text-sm">Remplissez les informations de votre futur filleul.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Eligibility Section - Critical for Energy Renovation */}
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Critères d'éligibilité obligatoires
          </h3>
          <div className="space-y-3">
             <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${eligibility.isHomeowner ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
                   {eligibility.isHomeowner && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={eligibility.isHomeowner} 
                  onChange={e => setEligibility({...eligibility, isHomeowner: e.target.checked})} 
                />
                <span className={`text-sm font-bold ${eligibility.isHomeowner ? 'text-blue-900' : 'text-gray-500'}`}>Le contact est propriétaire de son logement</span>
             </label>

             <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${eligibility.houseOver2Years ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
                   {eligibility.houseOver2Years && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={eligibility.houseOver2Years} 
                  onChange={e => setEligibility({...eligibility, houseOver2Years: e.target.checked})} 
                />
                <span className={`text-sm font-bold ${eligibility.houseOver2Years ? 'text-blue-900' : 'text-gray-500'}`}>La maison a plus de 2 ans (éligibilité aides)</span>
             </label>
          </div>
          {(!eligibility.isHomeowner || !eligibility.houseOver2Years) && (
            <p className="mt-3 text-[10px] text-amber-700 italic">
              * Ces conditions sont nécessaires pour bénéficier des solutions d'autonomie énergétique MyLight et des aides de l'État.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom Complet</label>
          <input
            type="text"
            placeholder="Ex: Jean Martin"
            required
            className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-blue-900 font-bold placeholder:text-gray-300"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone Mobile</label>
            <input
              type="tel"
              placeholder="06..."
              required
              className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-blue-900 font-bold"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse Email</label>
            <input
              type="email"
              placeholder="jean@email.com"
              required
              className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-blue-900 font-bold"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse Postale (Ville)</label>
          <input
            type="text"
            placeholder="Rue, Code Postal, Ville"
            required
            className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-blue-900 font-bold"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Legal Checkbox */}
        <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
          <input 
            type="checkbox" 
            id="terms" 
            required
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-blue-800 leading-relaxed cursor-pointer">
            Je certifie avoir l'accord de mon proche pour transmettre ses coordonnées à Free Energie. 
            Je reconnais que les récompenses perçues peuvent être soumises à déclaration fiscale selon la législation en vigueur.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="submit"
            disabled={!acceptTerms || !isEligible}
            className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
              acceptTerms && isEligible
              ? 'bg-blue-900 text-white shadow-blue-200 hover:bg-blue-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirmer le Parrainage
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferralForm;
