import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User 
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string; role: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteLogin = (userName: string, userEmail: string) => {
    setIsSubmitting(true);
    const finalName = userName.trim() || 'Creator';
    const finalEmail = userEmail.trim() || 'creator@tattvaco.film';

    const userData = {
      name: finalName,
      email: finalEmail,
      role: 'Writer / Showrunner',
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem('tattava_master_session', JSON.stringify(userData));
    window.dispatchEvent(new Event('tattava_user_session_updated'));

    setTimeout(() => {
      onLogin(userData);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (email.split('@')[0] ? email.split('@')[0].replace(/[._]/g, ' ') : 'Creator');
    handleCompleteLogin(finalName, email);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    const defaultName = provider === 'google' ? 'Google Creator' : 'Apple Creator';
    const defaultEmail = provider === 'google' ? 'creator@gmail.com' : 'creator@icloud.com';
    handleCompleteLogin(name || defaultName, email || defaultEmail);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#161210] font-sans selection:bg-[#b05232] selection:text-white">
      {/* 1. Cinematic Heritage Palace Sunrise Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 scale-[1.01]"
        style={{ backgroundImage: `url('/vyom-heritage-bg.jpg')` }}
      />

      {/* Atmospheric Mist & Warm Sunrise Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#fdfbf7]/85 via-[#f8f1e7]/40 to-black/35 z-[1] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-[1] pointer-events-none" />

      {/* Main Layout Container */}
      <div className="relative z-10 min-h-screen w-full max-w-[1540px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12 flex flex-col justify-between">
        
        {/* Top Header: Brand Logo */}
        <header className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start select-none">
            <div className="flex items-baseline font-serif text-3xl sm:text-[38px] text-[#221612] tracking-tight">
              <span className="font-playfair font-normal">Vyom</span>
              <span className="font-playfair font-semibold ml-2.5 inline-flex items-baseline">
                A
                <span className="relative inline-block ml-0.5">
                  I
                  {/* 4-point star sparkle as the dot on 'I' */}
                  <svg 
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-[#a84d2f] fill-current" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="text-xs sm:text-[13px] font-playfair font-medium text-[#a84d2f] tracking-wide -mt-1 ml-0.5">
              By TattvaCo
            </div>
          </div>
        </header>

        {/* Central Content Section: Left Hero + Right Floating Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 pr-0 lg:pr-8">
            
            {/* Category horizontal tag row matching reference image */}
            <div className="flex items-center gap-5 text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.24em] text-[#55433a] uppercase">
              <span className="w-8 h-[1.5px] bg-[#a84d2f]" />
              <span>HISTORY</span>
              <span>CULTURE</span>
              <span>ART</span>
              <span>HERITAGE</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-[66px] xl:text-[72px] leading-[1.08] tracking-tight text-[#201511] font-normal">
              <div>Ideas today.</div>
              <div>Timeless stories</div>
              <div className="italic text-[#b85834] font-normal">tomorrow.</div>
            </h1>

            {/* Sub-description */}
            <p className="text-sm sm:text-base text-[#463831] leading-relaxed max-w-lg font-sans font-normal">
              Your AI research and narrative companion for history, culture, art, heritage and beyond.
            </p>

            {/* Bottom Left Accent Tagline */}
            <div className="pt-2 sm:pt-4">
              <div className="flex items-start gap-3">
                <div className="w-[2px] h-8 bg-[#a84d2f] mt-0.5" />
                <div className="text-[10px] font-mono tracking-[0.22em] uppercase font-semibold text-[#4e3f37] leading-[1.4]">
                  <div>SAME ROOTS.</div>
                  <div>NEW PERSPECTIVES.</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Floating Card: Welcome to Vyom AI */}
          <div className="lg:col-span-5 flex justify-end">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-[460px] bg-[#14100e]/95 backdrop-blur-2xl border border-stone-800/80 ring-1 ring-amber-900/30 rounded-[28px] p-7 sm:p-9 shadow-2xl text-[#faf5f0] overflow-hidden"
            >
              {/* Subtle heritage mandala motif watermark in top right corner */}
              <svg 
                className="pointer-events-none absolute -top-8 -right-8 w-56 h-56 opacity-[0.05] text-amber-200 select-none" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M50 5 L55 35 L85 15 L65 45 L95 50 L65 55 L85 85 L55 65 L50 95 L45 65 L15 85 L35 55 L5 50 L35 45 L15 15 L45 35 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              </svg>

              {/* Top Navigation Row: New to Vyom AI? [Create account] */}
              <div className="flex items-center justify-end gap-2 text-xs mb-4">
                <span className="text-stone-400 font-sans">
                  {isSignUp ? 'Already have an account?' : 'New to Vyom AI?'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="border border-stone-700 hover:border-stone-500 rounded-full px-3.5 py-1 text-xs text-stone-200 hover:text-white transition-all cursor-pointer"
                >
                  {isSignUp ? 'Sign in' : 'Create account'}
                </button>
              </div>

              {/* Welcome Titles */}
              <div className="space-y-1.5 mb-6">
                <h2 className="font-playfair text-2xl sm:text-[30px] font-normal text-[#faf5f0] tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome to Vyom AI'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
                  {isSignUp 
                    ? 'Begin crafting culturally deep, authentic stories with TattvaCo.' 
                    : 'Sign in to continue your journey with TattvaCo.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1.5 font-sans">
                      Your Name
                    </label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-stone-800 bg-[#0c0908] px-3.5 py-2.5 focus-within:border-[#b05232] transition-colors">
                      <User className="w-4 h-4 text-stone-500 shrink-0" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Sharma"
                        className="w-full bg-transparent text-sm text-[#faf5f0] placeholder:text-stone-600 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-stone-300 block mb-1.5 font-sans">
                    Email address
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-stone-800 bg-[#0c0908] px-3.5 py-3 focus-within:border-[#b05232] transition-colors">
                    <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm text-[#faf5f0] placeholder:text-stone-600 outline-none"
                      autoFocus={!isSignUp}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-300 block mb-1.5 font-sans">
                    Password
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-stone-800 bg-[#0c0908] px-3.5 py-3 focus-within:border-[#b05232] transition-colors">
                    <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm text-[#faf5f0] placeholder:text-stone-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="text-right mt-1.5">
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to registered email.')}
                        className="text-xs text-[#c86c47] hover:text-[#e07b52] hover:underline transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-5 rounded-xl bg-[#b05232] hover:bg-[#c05d3b] active:bg-[#9a4528] text-white py-3.5 px-6 font-medium text-sm shadow-lg shadow-[#b05232]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-5">
                <div className="flex-1 h-[1px] bg-stone-800" />
                <span className="px-3 text-[10px] tracking-widest uppercase font-mono text-stone-500">
                  OR CONTINUE WITH
                </span>
                <div className="flex-1 h-[1px] bg-stone-800" />
              </div>

              {/* Social Logins */}
              <div className="space-y-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full rounded-xl bg-[#0c0908] border border-stone-800 hover:border-stone-700 hover:bg-stone-900/60 py-3 px-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium text-stone-200 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full rounded-xl bg-[#0c0908] border border-stone-800 hover:border-stone-700 hover:bg-stone-900/60 py-3 px-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium text-stone-200 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.71-.93 2.73 1 .08 2.02-.49 2.64-1.24z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Legal Terms Footer */}
              <p className="text-[11px] text-stone-500 text-center leading-relaxed mt-6">
                By signing in, you agree to our{' '}
                <a href="#" className="underline text-stone-400 hover:text-stone-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="underline text-stone-400 hover:text-stone-300">Privacy Policy</a>.
              </p>
            </motion.div>
          </div>

        </div>

        {/* Footer subtle spacer */}
        <div className="h-4" />

      </div>
    </div>
  );
};
