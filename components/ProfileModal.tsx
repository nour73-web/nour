
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onUpdate: (updatedData: Partial<User>) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-blue-900">Mon Profil</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Mes informations personnelles</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-900 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex justify-center mb-8">
           <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-blue-50">
                <img src={`https://ui-avatars.com/api/?name=${formData.name}&background=1e3a8a&color=fff&size=128`} alt="Profile" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Nom Complet</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Adresse Postale</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-900 text-white hover:bg-green-500 hover:text-blue-900 transition-all shadow-lg"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
