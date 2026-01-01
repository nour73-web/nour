
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation of API delay
    setTimeout(() => {
      // Check credentials strictly
      if (email.toLowerCase() === 'n.ab@freeenergie.fr' && password === '4774') {
        onLogin();
      } else {
        setError('Identifiants incorrects. Veuillez vérifier votre email et votre PIN.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setForgotMessage(`Un email de réinitialisation a été envoyé à ${forgotEmail}. Vérifiez vos spams.`);
      setTimeout(() => {
        setView('LOGIN');
        setForgotMessage('');
        setForgotEmail('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 transform rotate-3">
            <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-widest">Free Energie</h1>
          <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-wide">
            {view === 'LOGIN' ? 'Espace Parrainage' : 'Récupération'}
          </p>
        </div>

        {view === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Code PIN</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-green-500 transition-all text-center tracking-[0.5em] text-lg"
                required
              />
              <div className="text-right mt-2">
                <button 
                  type="button" 
                  onClick={() => setView('FORGOT')}
                  className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-blue-900 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-blue-900 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-6 relative z-10 animate-in slide-in-from-right-10">
             <div className="bg-blue-50 p-4 rounded-xl text-blue-900 text-xs font-medium leading-relaxed">
               Saisissez votre adresse email. Nous vous enverrons un code provisoire pour accéder à votre espace.
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Email de récupération</label>
                <input 
                  type="email" 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-blue-900 font-bold focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
             </div>

             {forgotMessage && (
                <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl text-center animate-in slide-in-from-top-2">
                  {forgotMessage}
                </div>
             )}

             <div className="flex flex-col gap-3">
               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-blue-900 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? 'Envoi...' : 'Recevoir mon code'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setView('LOGIN')}
                  className="w-full py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-blue-900"
                >
                  Retour à la connexion
                </button>
             </div>
          </form>
        )}

        <p className="text-center mt-8 text-[10px] text-gray-400 font-medium">
          Pas encore de compte ? <a href="#" className="text-blue-900 font-bold hover:underline">Contactez l'installateur</a>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
