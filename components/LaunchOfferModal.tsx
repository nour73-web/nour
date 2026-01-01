
import React, { useState } from 'react';
import { TOKEN_VALUE } from '../constants';

interface LaunchOfferModalProps {
  onSubmit: (contacts: { name: string; phone: string }[]) => void;
  onClose: () => void;
}

const LaunchOfferModal: React.FC<LaunchOfferModalProps> = ({ onSubmit, onClose }) => {
  const [contacts, setContacts] = useState(
    Array(5).fill({ name: '', phone: '' })
  );
  
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);

  const handleChange = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const isFormValid = contacts.every(c => c.name.trim() !== '' && c.phone.trim() !== '') && eligibilityConfirmed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(contacts);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden border-4 border-amber-300">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-200 rounded-full blur-2xl -ml-10 -mb-10 opacity-50"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6 relative z-10">
          <div className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-amber-200 animate-pulse">
            Offre de Lancement
          </div>
          <h2 className="text-3xl font-black text-blue-900 leading-tight">Gagnez <span className="text-amber-500">{TOKEN_VALUE}€</span> tout de suite !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Ajoutez 5 contacts intéressés par l'autonomie énergétique maintenant et recevez <strong>1 Jeton ({TOKEN_VALUE}€)</strong> immédiatement dans votre cagnotte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {contacts.map((contact, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="w-8 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-900 font-black text-xs shrink-0">
                {idx + 1}
              </div>
              <input
                type="text"
                placeholder="Nom du contact"
                className="flex-1 bg-gray-50 border-none rounded-xl text-xs font-bold px-3 focus:ring-2 focus:ring-amber-400"
                value={contact.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
              />
              <input
                type="tel"
                placeholder="06..."
                className="w-28 bg-gray-50 border-none rounded-xl text-xs font-bold px-3 focus:ring-2 focus:ring-amber-400"
                value={contact.phone}
                onChange={(e) => handleChange(idx, 'phone', e.target.value)}
              />
            </div>
          ))}

          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 mt-2">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                checked={eligibilityConfirmed}
                onChange={(e) => setEligibilityConfirmed(e.target.checked)}
              />
              <span className="text-[10px] font-bold text-amber-800 leading-tight">
                Je certifie que ces 5 contacts sont <span className="underline">propriétaires</span> d'une maison de <span className="underline">plus de 2 ans</span> (condition obligatoire).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 mt-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all transform ${
              isFormValid 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-900 hover:scale-105 shadow-amber-200' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isFormValid ? 'Valider et Recevoir 150€' : 'Complétez les infos'}
          </button>
          
          <button type="button" onClick={onClose} className="w-full py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-blue-900">
            Passer cette étape
          </button>
        </form>
      </div>
    </div>
  );
};

export default LaunchOfferModal;
