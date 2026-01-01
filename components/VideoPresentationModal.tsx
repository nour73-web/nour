
import React, { useState } from 'react';
import { generatePresentationVideo } from '../geminiVideoService';

interface VideoPresentationModalProps {
  onClose: () => void;
}

const VideoPresentationModal: React.FC<VideoPresentationModalProps> = ({ onClose }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generatePresentationVideo();
      if (url) {
        setVideoUrl(url);
      } else {
        setError("Impossible de générer la vidéo. Veuillez vérifier votre clé API.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la création de la vidéo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-blue-900/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Content */}
        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
          
          <button onClick={onClose} className="absolute top-6 left-6 md:hidden text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="relative z-10">
            <span className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              Concept Free Energie
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-blue-900 mb-6 leading-tight">
              L'Autonomie qui <br/>
              <span className="text-green-500">Rapporte Gros</span>
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="font-black text-blue-900 text-sm">Autonomie Énergétique</h4>
                  <p className="text-xs text-gray-500 mt-1">Équipez vos proches de pompes à chaleur et panneaux solaires pour réduire leurs factures à 0.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-black text-blue-900 text-sm">Gains Illimités</h4>
                  <p className="text-xs text-gray-500 mt-1">Touchez 150€ à chaque installation et un bonus de 500€ tous les 3 parrainages.</p>
                </div>
              </div>
            </div>

            {!videoUrl && !isGenerating && (
              <button 
                onClick={handleGenerateClick}
                className="group flex items-center bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-blue-900 transition-all shadow-xl"
              >
                <span className="mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Générer la Vidéo Explicative (IA)
              </button>
            )}
            
            {error && (
              <p className="text-red-500 text-xs font-bold mt-4">{error}</p>
            )}
          </div>
        </div>

        {/* Right Side: Video Player / Placeholder */}
        <div className="bg-gray-900 flex-1 relative min-h-[300px] flex items-center justify-center overflow-hidden">
           <button onClick={onClose} className="absolute top-6 right-6 hidden md:block text-white/50 hover:text-white z-20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {isGenerating ? (
            <div className="text-center p-8">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-white font-black uppercase tracking-widest mb-2">Création Veo en cours...</h3>
              <p className="text-gray-400 text-xs max-w-xs mx-auto">L'IA de Google génère une vidéo unique illustrant le parrainage solaire. Cela peut prendre 1 à 2 minutes.</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full relative group">
               <video 
                 src={videoUrl} 
                 className="w-full h-full object-cover" 
                 controls 
                 autoPlay 
                 loop
               />
               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-[10px] font-mono">
                 Généré par Google Veo
               </div>
            </div>
          ) : (
            <div className="text-center p-8 relative z-10">
               <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </div>
               <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">En attente de génération</p>
            </div>
          )}
          
          {/* Background decoration for placeholder */}
          {!videoUrl && (
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPresentationModal;
