import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

const AUTH_NOT_CONFIGURED =
  'Sign-in is not configured for this deployment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing).';

/**
 * Every path goes through Supabase. The app opens only after AuthContext reports a real
 * signed-in identity, so this screen never creates a session on its own.
 */
export const LoginScreen: React.FC = () => {
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    auth.status === 'disabled' ? AUTH_NOT_CONFIGURED : null
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: AuthMode) => {
    clearFeedback();
    setMode(newMode);
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsSubmitting(true);
    try {
      // On success the Supabase session changes and App leaves this screen.
      await auth.signIn(email.trim(), password);
    } catch (err: any) {
      console.warn('Sign-in error:', err);
      setErrorMsg(err?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Account
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { needsConfirmation } = await auth.signUp(email.trim(), password, name.trim());
      if (needsConfirmation) {
        setSuccessMsg(`Account created. We sent a confirmation link to ${email.trim()}. Confirm it, then sign in.`);
        setMode('sign-in');
        setPassword('');
      }
    } catch (err: any) {
      console.warn('Sign-up error:', err);
      setErrorMsg(err?.message || 'Could not create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await auth.resetPassword(email.trim());
      setSuccessMsg(`Password reset instructions have been sent to ${email.trim()}.`);
    } catch (err: any) {
      console.warn('Password reset error:', err);
      setErrorMsg(err?.message || 'Unable to send reset link. Please check your email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign In with Google (redirects to Google, then back to the app)
  const handleGoogleAuth = async () => {
    clearFeedback();
    setIsSubmitting(true);
    try {
      await auth.signInWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const message: string = err?.message || '';
      setErrorMsg(
        message.includes('provider is not enabled')
          ? 'Google sign-in is not enabled for this workspace yet. Please use email sign in.'
          : message || 'Google sign in encountered an issue. Please try email sign in.'
      );
      setIsSubmitting(false);
    }
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
            
            {/* Category horizontal tag row */}
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

          {/* Right Floating Card: Real-time Authentication */}
          <div className="lg:col-span-5 flex justify-end">
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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

              {/* Top Navigation Row: Toggle between Sign in & Create account */}
              {mode !== 'forgot-password' ? (
                <div className="flex items-center justify-end gap-2 text-xs mb-4">
                  <span className="text-stone-400 font-sans">
                    {mode === 'sign-up' ? 'Already have an account?' : 'New to Vyom AI?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
                    className="border border-stone-700 hover:border-stone-500 rounded-full px-3.5 py-1 text-xs text-stone-200 hover:text-white transition-all cursor-pointer"
                  >
                    {mode === 'sign-up' ? 'Sign in' : 'Create account'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-start gap-1 text-xs mb-4">
                  <button
                    type="button"
                    onClick={() => switchMode('sign-in')}
                    className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign in</span>
                  </button>
                </div>
              )}

              {/* Headings */}
              <div className="space-y-1.5 mb-6">
                <h2 className="font-playfair text-2xl sm:text-[30px] font-normal text-[#faf5f0] tracking-tight">
                  {mode === 'sign-up' && 'Create your account'}
                  {mode === 'sign-in' && 'Welcome to Vyom AI'}
                  {mode === 'forgot-password' && 'Reset your password'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
                  {mode === 'sign-up' && 'Begin crafting culturally deep, authentic stories with TattvaCo.'}
                  {mode === 'sign-in' && 'Sign in to continue your journey with TattvaCo.'}
                  {mode === 'forgot-password' && 'Enter your registered email and we will send you a password reset link.'}
                </p>
              </div>

              {/* Alert Feedback Messages */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. Sign In & Sign Up Form */}
              {mode !== 'forgot-password' ? (
                <form onSubmit={mode === 'sign-up' ? handleSignUp : handleSignIn} className="space-y-4">
                  {mode === 'sign-up' && (
                    <div>
                      <label className="text-xs font-medium text-stone-300 block mb-1.5 font-sans">
                        Full Name
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
                        autoFocus={mode === 'sign-in'}
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
                        placeholder={mode === 'sign-up' ? 'Minimum 6 characters' : 'Enter your password'}
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

                    {mode === 'sign-in' && (
                      <div className="text-right mt-1.5">
                        <button
                          type="button"
                          onClick={() => switchMode('forgot-password')}
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
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>{mode === 'sign-up' ? 'Create account' : 'Sign in'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* 2. Forgot Password Form */
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1.5 font-sans">
                      Registered Email
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
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 rounded-xl bg-[#b05232] hover:bg-[#c05d3b] active:bg-[#9a4528] text-white py-3.5 px-6 font-medium text-sm shadow-lg shadow-[#b05232]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Send reset link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('sign-in')}
                      className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Return to Sign in
                    </button>
                  </div>
                </form>
              )}

              {/* Divider & Google OAuth (available in sign-in & sign-up) */}
              {mode !== 'forgot-password' && (
                <>
                  <div className="flex items-center my-5">
                    <div className="flex-1 h-[1px] bg-stone-800" />
                    <span className="px-3 text-[10px] tracking-widest uppercase font-mono text-stone-500">
                      OR CONTINUE WITH
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-800" />
                  </div>

                  {/* Google OAuth Button Only (Apple ID removed as requested) */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-[#0c0908] border border-stone-800 hover:border-stone-700 hover:bg-stone-900/60 py-3.5 px-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium text-stone-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      <span>
                        {mode === 'sign-up' ? 'Sign up with Google' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                </>
              )}

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
