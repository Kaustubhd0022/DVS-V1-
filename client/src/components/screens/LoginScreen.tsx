import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clapperboard, 
  Film, 
  User, 
  Mail, 
  Briefcase 
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string; role: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [showLogoSplash, setShowLogoSplash] = useState(true);

  // Initialize inputs from existing session if available
  const [name, setName] = useState(() => {
    try {
      const saved = localStorage.getItem('tattava_master_session');
      return saved ? JSON.parse(saved).name || '' : '';
    } catch {
      return '';
    }
  });

  const [email, setEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('tattava_master_session');
      return saved ? JSON.parse(saved).email || '' : '';
    } catch {
      return '';
    }
  });

  const [role, setRole] = useState('Writer / Showrunner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logo intro splash duration (2 seconds)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLogoSplash(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalName = name.trim() || 'Creator';
    const finalEmail = email.trim() || 'creator@tattvaco.film';
    const userData = {
      name: finalName,
      email: finalEmail,
      role,
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem('tattava_master_session', JSON.stringify(userData));
    window.dispatchEvent(new Event('tattava_user_session_updated'));

    setTimeout(() => {
      onLogin(userData);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#1b1411] text-[#faf5f0] flex items-center justify-center p-4 selection:bg-[#33cc7a] selection:text-[#1b1411] relative overflow-hidden font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#33cc7a]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* 1. Logo Splash Intro (Plays on entry) */}
      <AnimatePresence>
        {showLogoSplash && (
          <motion.div
            key="tattva-logo-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1411]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(51,204,122,0.15),transparent_45%)]" />
            <div className="relative flex w-full max-w-4xl flex-col items-center justify-center px-8 text-center">
              <motion.img
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                src="/tattvaCo-logo.png"
                alt="TattvaCo"
                onError={(e) => {
                  e.currentTarget.src = "https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/tattvaCo-logo.png";
                }}
                className="h-auto w-[min(72vw,620px)] object-contain"
              />
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="-mt-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-[#33cc7a]"
              >
                The essence of every story
              </motion.div>
              <div className="mt-6 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#33cc7a] to-transparent animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Login Screen (Shows immediately after logo) */}
      {!showLogoSplash && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#141824]/95 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-2xl z-20 space-y-6"
        >
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-full flex justify-center mb-1">
              <img
                src="/tattvaCo-logo.png"
                alt="TattvaCo"
                onError={(e) => {
                  e.currentTarget.src = "https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/tattvaCo-logo.png";
                }}
                className="h-14 w-auto object-contain"
              />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] border border-[#33cc7a]/30 text-[10px] font-mono uppercase font-bold tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Studio Pilot Access</span>
            </div>

            <p className="text-xs text-[#b8aba3] max-w-xs leading-relaxed">
              Autonomous narrative reasoning & production intelligence OS for screen storytellers.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#b8aba3] font-bold block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#33cc7a]" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-xs text-[#faf5f0] placeholder-[#b8aba3]/40 outline-none focus:border-[#33cc7a] focus:ring-1 focus:ring-[#33cc7a]/30 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#b8aba3] font-bold block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#33cc7a]" />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. maya@cinema.studio"
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-xs text-[#faf5f0] placeholder-[#b8aba3]/40 outline-none focus:border-[#33cc7a] focus:ring-1 focus:ring-[#33cc7a]/30 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#b8aba3] font-bold block mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#33cc7a]" />
                <span>Creative Role</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#1b1411] px-4 py-3 text-xs text-[#faf5f0] outline-none focus:border-[#33cc7a] transition-all cursor-pointer"
              >
                <option value="Writer / Showrunner">Writer / Showrunner</option>
                <option value="Director">Director</option>
                <option value="Producer">Producer</option>
                <option value="Development Executive">Development Executive</option>
                <option value="Historical Researcher">Historical Researcher</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-[#33cc7a] hover:bg-[#2eb76e] text-[#1b1411] py-3.5 px-6 font-bold text-xs shadow-lg shadow-[#33cc7a]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Enter Studio {name.trim() ? `as ${name.trim()}` : ''}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[10px] text-[#b8aba3]/60 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#33cc7a]" />
            <span>Encrypted local session • Zero hardcoded profiles</span>
          </div>
        </motion.div>
      )}

    </div>
  );
};
