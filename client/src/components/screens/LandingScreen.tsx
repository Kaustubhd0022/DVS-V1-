import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Clapperboard,
  Film,
  Globe2,
  Layers3,
  Lock,
  Menu,
  Network,
  Play,
  Search,
  Sparkles,
  X,
  Wand2,
  ShieldCheck,
  Compass,
} from 'lucide-react';

type ModalMode = 'signin' | 'waitlist' | 'feature' | null;

type Feature = {
  title: string;
  description: string;
  eyebrow: string;
  live?: boolean;
};

const cinematicImages = {
  set: 'https://dp8ij3ml0f16h.cloudfront.net/s3_files/styles/scaled_only_w_1920px_/s3/film/kep/szenvedelyes-nok_07.jpg.webp?itok=kRFcyvFO',
  palace: 'https://fr.web.img2.acsta.net/pictures/18/05/11/09/40/3269450.jpg',
  crew: 'https://obrazki.ai/cdn-cgi/image/width%3D1200%2Cquality%3D85%2Cformat%3Dauto%2Cfit%3Dscale-down/nb/film-director--set-discussion--cast-crew--intense-focus',
};

const roadmap = [
  {
    id: 'V1',
    eyebrow: 'NARRATIVE INTELLIGENCE',
    title: 'Develop the story.',
    description: 'Idea to researched, reasoned and human-approved story package. Tattava builds a persistent intelligence layer around every creative decision.',
    flow: 'Idea → Understand → Research → Direction → Canon → Generate → Evaluate',
    status: 'LIVE PILOT',
    icon: Brain,
    accent: 'border-[#33cc7a]/30 bg-[#33cc7a]/5',
    features: ['Project Intelligence', 'Story Brain', 'Research & Evidence', 'Character Intelligence', 'Screenplay & Dialogue', 'Canon & Continuity', 'Evaluation → Repair'],
  },
  {
    id: 'V2',
    eyebrow: 'VISUAL INTELLIGENCE',
    title: 'See the story.',
    description: 'Carry the same narrative intelligence into character, world, art direction, references and visual development.',
    flow: 'Story → Character World → Art Direction → References → Storyboards',
    status: 'COMING SOON',
    icon: Layers3,
    accent: 'border-[#bacde0]/20 bg-[#bacde0]/5',
    features: ['Story World', 'Character Visuals', 'Locations', 'Art Direction', 'Concept Development', 'Storyboarding'],
  },
  {
    id: 'V3',
    eyebrow: 'GENAI PRODUCTION',
    title: 'Make the film.',
    description: 'Move from an approved visualised story world into shot planning, generated footage, sound and production intelligence.',
    flow: 'Visualisation → Shots → Video → Sound → Assembly → QC',
    status: 'COMING SOON',
    icon: Film,
    accent: 'border-[#b8aba3]/20 bg-[#b8aba3]/5',
    features: ['Shot Planning', 'AI Visual Generation', 'Video Generation', 'Sound & Performance', 'Assembly', 'Human QC'],
  },
  {
    id: 'V4',
    eyebrow: 'LOCALIZATION & ADAPTATION',
    title: 'Create versions.',
    description: 'Adapt original stories across languages and cultural contexts while preserving the canonical intent of the project.',
    flow: 'Original → Culture → Language → Dialogue → Performance → Adaptation',
    status: 'COMING SOON',
    icon: Globe2,
    accent: 'border-[#33cc7a]/20 bg-[#33cc7a]/5',
    features: ['Language Intelligence', 'Cultural Context', 'Character Voice', 'Regional Idiom', 'Dubbing', 'Adaptation Rules'],
  },
];

const capabilities: Feature[] = [
  { title: 'Story Brain', eyebrow: 'V1 · LIVE', description: 'A persistent project memory that understands what is known, unknown, decided and unresolved.', live: true },
  { title: 'Research & Evidence', eyebrow: 'V1 · LIVE', description: 'Research is connected to findings, sources, uncertainty and the creative decisions it supports.', live: true },
  { title: 'Narrative Reasoning', eyebrow: 'V1 · LIVE', description: 'Explore competing story directions before the human creative decision becomes canon.', live: true },
  { title: 'Canon & Continuity', eyebrow: 'V1 · LIVE', description: 'Approved decisions become project truth. Contradictions and downstream dependencies stay visible.', live: true },
  { title: 'Evaluation → Repair', eyebrow: 'V1 · LIVE', description: 'Diagnose narrative problems, propose repairs, regenerate and re-evaluate against canonical context.', live: true },
  { title: 'Character Intelligence', eyebrow: 'V1 · LIVE', description: 'Motivation, relationships, arcs and consequences stay connected to the evolving story world.', live: true },
  { title: 'Visual Development', eyebrow: 'V2 · ROADMAP', description: 'Turn story intelligence into visual language, art direction and references.' },
  { title: 'AI Filmmaking', eyebrow: 'V3 · ROADMAP', description: 'Carry canonical story intent into generated shots, video, sound and assembly.' },
];

function track(event: string, properties: Record<string, string> = {}) {
  try {
    const key = 'tattava_marketing_events';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push({ event, properties, timestamp: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(current.slice(-250)));
  } catch {
    // Analytics must never block the experience.
  }
}

export const LandingScreen: React.FC<{ onEnterProduct: () => void }> = ({ onEnterProduct }) => {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    track('landing_view');
    const timer = window.setInterval(() => setDemoStep((value) => (value + 1) % 4), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const demoSteps = useMemo(() => [
    { label: 'UNDERSTAND', title: 'What is still unresolved?', copy: 'Tattava detects the core creative question blocking the next meaningful decision.', meta: '1 blocking creative dilemma' },
    { label: 'RESEARCH', title: 'What does the evidence say?', copy: 'Primary evidence, historical precedents, and sources stay permanently tethered to the project.', meta: '12 verified source citations' },
    { label: 'DIRECTION', title: 'Which story direction do we choose?', copy: 'Competing story directions are compared with consequences across characters, tone, and budget.', meta: '3 explored directions' },
    { label: 'CANON', title: 'What becomes established truth?', copy: 'The creator explicitly approves the choice. Approved truth becomes canon and locks downstream dependencies.', meta: 'Human gate enforced' },
  ], []);

  const openWaitlist = () => {
    track('waitlist_open');
    setSubmitted(false);
    setModal('waitlist');
  };

  const openFeature = (feature: Feature) => {
    track(feature.live ? 'feature_cta_click' : 'fake_door_open', { feature: feature.title });
    setSelectedFeature(feature);
    setSubmitted(false);
    setModal('feature');
  };

  const enterProduct = () => {
    track('product_start_click');
    onEnterProduct();
  };

  const openSignin = () => {
    track('login_clicked');
    setModal('signin');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#1b1411] text-[#faf5f0] selection:bg-[#33cc7a] selection:text-[#1b1411]">
      {/* Intro Splash */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="tattava-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#1b1411]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(51,204,122,0.15),transparent_40%)]" />
            <div className="relative flex w-full max-w-4xl flex-col items-center justify-center px-8">
              <img
                src="/tattvaCo-logo.png"
                alt="TattvaCo"
                onError={(event) => {
                  event.currentTarget.src = "https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/tattvaCo-logo.png";
                }}
                className="h-auto w-[min(72vw,620px)] object-contain"
              />
              <div className="-mt-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-[#33cc7a]">
                The essence of every story
              </div>
              <div className="mt-6 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#33cc7a] to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linea Floating Island Navigation Bar */}
      <header className="fixed left-0 right-0 top-3 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/[0.12] bg-[#1b1411]/85 px-3 sm:px-5 backdrop-blur-xl shadow-2xl pointer-events-auto">
          {/* Brand mark & Word */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2.5">
            <svg className="w-8 h-5 fill-none stroke-current stroke-2 stroke-linecap-round" viewBox="0 0 36 24">
              <path d="M4 18 C12 6, 20 20, 32 6" className="stroke-[#33cc7a]" strokeWidth="3" />
              <path d="M4 12 C14 2, 22 16, 32 12" className="stroke-[#faf5f0]/70" strokeWidth="2" />
            </svg>
            <span className="text-base font-bold tracking-tight text-[#faf5f0]">TattvaCo</span>
          </button>

          {/* Links */}
          <nav className="hidden items-center gap-7 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#faf5f0]/70 md:flex">
            <a href="#hero" className="transition hover:text-[#33cc7a]">Product</a>
            <a href="#stage" className="transition hover:text-[#33cc7a]">Intelligence</a>
            <a href="#roadmap" className="transition hover:text-[#33cc7a]">V1–V4</a>
            <a href="#capabilities" className="transition hover:text-[#33cc7a]">Capabilities</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSignin}
              className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#faf5f0]/80 transition hover:text-white"
            >
              Sign in
            </button>
            <button
              onClick={openWaitlist}
              className="group relative inline-flex items-center justify-center rounded-full bg-[#33cc7a] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1b1411] transition hover:bg-[#2eb76e] shadow-md shadow-[#33cc7a]/25"
            >
              <span>Early Access</span>
              <div className="linea-btn-wave h-3 text-[#1b1411] ml-1.5">
                <span className="h-1.5" />
                <span className="h-3" />
                <span className="h-2" />
              </div>
            </button>
            <button
              className="md:hidden p-1.5 text-[#faf5f0]"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-2 max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#1b1411]/95 p-6 backdrop-blur-2xl md:hidden shadow-2xl pointer-events-auto"
            >
              <div className="flex flex-col gap-4 text-sm font-semibold text-[#faf5f0]">
                <a href="#hero" onClick={() => setMenuOpen(false)}>Product</a>
                <a href="#stage" onClick={() => setMenuOpen(false)}>Intelligence</a>
                <a href="#roadmap" onClick={() => setMenuOpen(false)}>V1–V4</a>
                <a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</a>
                <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                  <button className="text-left py-1 text-xs uppercase" onClick={() => { setMenuOpen(false); openSignin(); }}>Sign in</button>
                  <button onClick={() => { setMenuOpen(false); openWaitlist(); }} className="rounded-full bg-[#33cc7a] px-5 py-2.5 text-xs font-bold text-[#1b1411]">Join Early Access</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* =====================================================================
            SECTION 1: LINEA SLATE NAVY HERO (#1f3954)
            With Orbital SVG Flow Curves & Floating Soundwave Chips
            ===================================================================== */}
        <section id="hero" className="relative min-h-[960px] overflow-hidden bg-[#1f3954] text-[#faf5f0] pt-28 pb-24">
          {/* Background Cinematic Texture & Gradient Shading */}
          <div className="absolute inset-0 pointer-events-none">
            {!videoFailed ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={cinematicImages.set}
                onError={() => setVideoFailed(true)}
                className="h-full w-full object-cover opacity-25"
              >
                <source src="https://cdn.coverr.co/videos/coverr-film-director-s-pov-7972/1080p.mp4" type="video/mp4" />
              </video>
            ) : (
              <img src={cinematicImages.set} alt="" className="h-full w-full object-cover opacity-25" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f3954] via-[#1f3954]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f3954] via-transparent to-[#1f3954]/40" />
          </div>

          {/* Linea Signature Orbital SVG Lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute w-full h-full inset-0" preserveAspectRatio="none" viewBox="0 0 1440 960">
              <ellipse cx="1080" cy="1150" rx="640" ry="850" fill="none" stroke="rgba(250, 245, 240, 0.22)" strokeWidth="1.5" />
              <ellipse cx="1080" cy="1150" rx="640" ry="850" fill="none" stroke="#33cc7a" strokeWidth="2.5" className="linea-hero-flow" />

              <ellipse cx="780" cy="1380" rx="980" ry="1100" fill="none" stroke="rgba(250, 245, 240, 0.16)" strokeWidth="1.5" />
              <ellipse cx="780" cy="1380" rx="980" ry="1100" fill="none" stroke="#33cc7a" strokeWidth="2" className="linea-hero-flow" />
            </svg>
          </div>

          {/* Floating Soundwave Chips */}
          <div className="absolute right-8 top-36 hidden lg:flex flex-col gap-5 z-20 pointer-events-none max-w-sm">
            {/* Chip 1: Warm Cream Card with Green Soundwave */}
            <div className="linea-caption-pill animate-bounce-slow shadow-2xl">
              <div className="linea-wave-bars text-[#33cc7a]">
                <span className="h-2" />
                <span className="h-4" />
                <span className="h-3" />
                <span className="h-2" />
              </div>
              <span className="text-xs font-semibold">Who holds legitimate succession if the King is lost?</span>
            </div>

            {/* Chip 2: Signal Mint Card with Espresso Text */}
            <div className="linea-caption-pill-mint self-end shadow-2xl">
              <div className="linea-wave-bars text-[#1b1411]">
                <span className="h-3" />
                <span className="h-4" />
                <span className="h-2" />
              </div>
              <span className="text-xs font-bold">12 sources verified · Ancient dynastic law</span>
            </div>

            {/* Chip 3: Warm Cream Card with Green Soundwave */}
            <div className="linea-caption-pill self-start shadow-2xl">
              <div className="linea-wave-bars text-[#33cc7a]">
                <span className="h-2" />
                <span className="h-3" />
                <span className="h-4" />
              </div>
              <span className="text-xs font-semibold">Canon locked: The Regent assumes provisional rule</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative mx-auto flex min-h-[760px] max-w-6xl flex-col justify-center px-6 lg:px-12 z-10">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#33cc7a]/30 bg-[#33cc7a]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#33cc7a]">
                <div className="linea-btn-wave h-3 text-[#33cc7a]">
                  <span className="h-1.5" />
                  <span className="h-3" />
                  <span className="h-2" />
                </div>
                <span>AI-Native Film Development & Production OS</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.94] tracking-[-0.04em] text-[#faf5f0]">
                Develop stories
                <br />
                <span className="text-[#bacde0]/65 font-light">with an AI that</span>
                <br />
                <span className="text-[#33cc7a]">remembers.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-[#bacde0]/90">
                Tattava turns ideas into researched, structured and continuously grounded story worlds — keeping every creative decision in creator hands.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={enterProduct}
                  className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#33cc7a] px-8 py-4 text-sm font-bold text-[#1b1411] transition hover:bg-[#2eb76e] shadow-xl shadow-[#33cc7a]/30"
                >
                  <span>Start Developing</span>
                  <div className="linea-btn-wave h-3 text-[#1b1411]">
                    <span className="h-1.5" />
                    <span className="h-3" />
                    <span className="h-2" />
                  </div>
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#stage"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-[#faf5f0] backdrop-blur transition hover:bg-white/10"
                >
                  <span>Explore Architecture</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Micro Metrics Proof */}
            <div className="mt-16 pt-8 border-t border-white/[0.12] grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl text-xs">
              <div>
                <div className="text-lg font-bold text-[#33cc7a]">100%</div>
                <div className="text-[#bacde0]/70 uppercase tracking-wider text-[10px] mt-0.5">Authoritative Canon</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#faf5f0]">Persistent</div>
                <div className="text-[#bacde0]/70 uppercase tracking-wider text-[10px] mt-0.5">Story Brain Memory</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#33cc7a]">Zero</div>
                <div className="text-[#bacde0]/70 uppercase tracking-wider text-[10px] mt-0.5">Hallucinated Canon</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#faf5f0]">16 Episodes</div>
                <div className="text-[#bacde0]/70 uppercase tracking-wider text-[10px] mt-0.5">Coordinated State</div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: LINEA DUAL-TONE SPLIT STAGE (#stage)
            Curved Sheet Layer in Warm Cream (#faf5f0) & Espresso (#1b1411)
            ===================================================================== */}
        <section id="stage" className="relative -mt-10 rounded-t-[3.5rem] bg-[#faf5f0] text-[#1b1411] px-6 py-24 lg:px-12 z-30 shadow-2xl">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#33cc7a] bg-[#1b1411] px-3 py-1 rounded-full">
                Interactive System Stage
              </span>
              <h2 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-[#1b1411]">
                Not another prompt box.
                <br />
                <span className="text-[#66574f] font-light">A story development OS.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#66574f]">
                Every creative choice progresses through a verified epistemic loop from unresolved question to verified evidence, candidate direction, and human-approved canon.
              </p>
            </div>

            {/* Split Stage Card Container */}
            <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-[#1b1411]/10 bg-[#eee5dc] p-3 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-3 min-h-[520px]">
                {/* Left Panel: Deep Espresso Voice & Dilemma Stage */}
                <div className="relative rounded-[2rem] bg-[#1b1411] p-8 sm:p-10 text-[#faf5f0] flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#33cc7a]/5 rounded-full blur-[80px]" />
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#33cc7a]">
                        <Lock className="w-3.5 h-3.5" /> Discovery & Research State
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#faf5f0]">
                        Episode 1 Pilot
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
                      {['Understand', 'Research', 'Direction', 'Canon'].map((step, i) => (
                        <button
                          key={step}
                          onClick={() => setDemoStep(i)}
                          className={`rounded-full px-3.5 py-1.5 transition ${demoStep === i ? 'bg-[#33cc7a] text-[#1b1411]' : 'bg-white/5 text-[#faf5f0]/60 hover:text-white'}`}
                        >
                          {String(i + 1).padStart(2, '0')} {step}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8">
                      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#33cc7a]">
                        {demoSteps[demoStep].label}
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#faf5f0]">
                        {demoSteps[demoStep].title}
                      </h3>
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#faf5f0]/70">
                        {demoSteps[demoStep].copy}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#33cc7a]/15 border border-[#33cc7a]/30 px-3.5 py-1.5 text-[11px] font-bold text-[#33cc7a]">
                        {demoSteps[demoStep].meta}
                      </div>
                    </div>
                  </div>

                  {/* Equalizer Waveform Stage at bottom of Left Panel */}
                  <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-end gap-1 h-6">
                        <span className="w-1 bg-[#33cc7a] rounded-full animate-pulse h-4" />
                        <span className="w-1 bg-[#33cc7a] rounded-full animate-pulse h-6 delay-75" />
                        <span className="w-1 bg-[#33cc7a] rounded-full animate-pulse h-3 delay-150" />
                        <span className="w-1 bg-[#33cc7a] rounded-full animate-pulse h-5 delay-200" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#faf5f0]/80">Active Reasoning Loop</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#faf5f0]/40">LATENCY 42ms</span>
                  </div>
                </div>

                {/* Right Panel: Signal Mint Canon Truth Stage */}
                <div className="relative rounded-[2rem] bg-[#33cc7a] p-8 sm:p-10 text-[#1b1411] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1b1411]/15 pb-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1411]">
                        <ShieldCheck className="w-4 h-4 text-[#1b1411]" /> Canonical Project Truth
                      </div>
                      <span className="rounded-full bg-[#1b1411]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1b1411]">
                        Locked Canon
                      </span>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#faf5f0] p-6 shadow-xl">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#66574f]">
                        Approved Authoritative Fact
                      </div>
                      <h4 className="mt-2 text-lg font-bold text-[#1b1411] leading-snug">
                        The Regent assumes provisional rule under the 14-day Regency Council charter.
                      </h4>
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                        <span className="rounded-full bg-[#33cc7a]/20 px-2.5 py-0.5 font-bold text-[#1b1411]">
                          Plot Anchor
                        </span>
                        <span className="rounded-full bg-[#1b1411]/10 px-2.5 py-0.5 font-semibold text-[#1b1411]">
                          Ep 1 · Scene 4
                        </span>
                        <span className="rounded-full bg-[#1b1411]/10 px-2.5 py-0.5 font-semibold text-[#1b1411]">
                          Verified by Creator
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-2xl bg-[#1b1411]/10 p-4">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-[#1b1411]/70">Evidence Chain</div>
                        <div className="text-xs font-bold text-[#1b1411] mt-1">12 Historical Laws</div>
                      </div>
                      <div className="rounded-2xl bg-[#1b1411]/10 p-4">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-[#1b1411]/70">Protected Deps</div>
                        <div className="text-xs font-bold text-[#1b1411] mt-1">4 Downstream Scenes</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#1b1411]/15 flex items-center justify-between text-xs font-bold text-[#1b1411]">
                    <span>Human Approval Required</span>
                    <Check className="w-5 h-5 text-[#1b1411]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: LINEA BENTO CAPABILITIES (#capabilities)
            Curved Sheet Layer in Dark Espresso (#1b1411)
            ===================================================================== */}
        <section id="capabilities" className="relative -mt-10 rounded-t-[3.5rem] bg-[#1b1411] text-[#faf5f0] px-6 py-28 lg:px-12 z-30">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#33cc7a]">
                  System Architecture
                </span>
                <h2 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-[#faf5f0]">
                  Capabilities, not checklists.
                </h2>
              </div>
              <p className="max-w-md text-xs sm:text-sm text-[#b8aba3] leading-relaxed">
                Tattava builds persistent narrative memory so your project intelligence deepens as your script and season unfold.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => (
                <button
                  key={cap.title}
                  onClick={() => openFeature(cap)}
                  className="group rounded-3xl border border-white/[0.08] bg-[#2e241f] p-6 text-left transition hover:border-[#33cc7a]/50 hover:bg-[#382b25] shadow-xl flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={cap.live ? 'rounded-full bg-[#33cc7a]/15 text-[#33cc7a] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider' : 'rounded-full bg-white/[0.06] text-[#b8aba3] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider'}>
                        {cap.eyebrow}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#b8aba3] transition group-hover:translate-x-1 group-hover:text-[#33cc7a]" />
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-[#faf5f0] tracking-tight">{cap.title}</h3>
                    <p className="mt-2 text-xs text-[#b8aba3] leading-relaxed">{cap.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: ROADMAP V1–V4 (#roadmap)
            Curved Sheet Layer in Warm Sand (#eee5dc) & Espresso (#1b1411)
            ===================================================================== */}
        <section id="roadmap" className="relative -mt-10 rounded-t-[3.5rem] bg-[#eee5dc] text-[#1b1411] px-6 py-28 lg:px-12 z-30 shadow-2xl">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1b1411] bg-[#33cc7a] px-3 py-1 rounded-full">
                  Four Stages of Creation
                </span>
                <h2 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-[#1b1411]">
                  One intelligence layer.
                  <br />
                  <span className="text-[#66574f] font-light">From seed to screen.</span>
                </h2>
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#66574f]">
                V1 → V2 → V3 → V4
              </div>
            </div>

            <div className="mt-14 space-y-4">
              {roadmap.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <article
                    key={stage.id}
                    className="group rounded-3xl border border-[#1b1411]/15 bg-[#faf5f0] p-7 sm:p-10 shadow-lg hover:shadow-2xl transition grid lg:grid-cols-[140px_1fr_300px] gap-6 items-center"
                  >
                    <div>
                      <div className="text-5xl font-bold tracking-tight text-[#1b1411]">{stage.id}</div>
                      <div className="mt-2 text-[9px] uppercase tracking-wider font-bold text-[#33cc7a] bg-[#1b1411] px-2 py-0.5 rounded-full inline-block">
                        {stage.eyebrow}
                      </div>
                      <Icon className="mt-4 w-6 h-6 text-[#66574f] group-hover:text-[#33cc7a] transition" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-[#1b1411]">{stage.title}</h3>
                        <span className="rounded-full bg-[#1b1411]/10 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1b1411]">
                          {stage.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-[#66574f] leading-relaxed max-w-xl">
                        {stage.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {stage.features.map((f) => (
                          <span key={f} className="rounded-full bg-[#eee5dc] px-3 py-1 text-[10px] font-semibold text-[#1b1411]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:border-l lg:border-[#1b1411]/10 lg:pl-6">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-[#66574f]">Creative Flow</div>
                      <div className="mt-2 text-xs font-medium text-[#1b1411] leading-relaxed">{stage.flow}</div>
                      <div className="mt-4 text-[10px] uppercase font-bold tracking-wider text-[#33cc7a]">
                        {idx === 0 ? '✓ Available Now in Pilot' : 'Roadmap Validation'}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: HEROIC FINAL CTA SECTION
            Deep Roasted Espresso (#1b1411) with Signature Mint Button
            ===================================================================== */}
        <section className="relative -mt-10 rounded-t-[3.5rem] bg-[#1b1411] text-[#faf5f0] px-6 py-32 lg:px-12 z-30 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] mb-8">
              <Clapperboard className="w-7 h-7" />
            </div>

            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-[#faf5f0]">
              Build the project.
              <br />
              <span className="text-[#b8aba3]/60 font-light">Not another prompt.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-[#b8aba3]">
              Start with your idea. Lock canonical ground truth. Explore directions. Evaluate and repair continuity. Carry project intelligence into production.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={enterProduct}
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#33cc7a] px-9 py-4 text-sm font-bold text-[#1b1411] transition hover:bg-[#2eb76e] shadow-2xl shadow-[#33cc7a]/40"
              >
                <span>Start Developing Now</span>
                <div className="linea-btn-wave h-3 text-[#1b1411]">
                  <span className="h-1.5" />
                  <span className="h-3" />
                  <span className="h-2" />
                </div>
              </button>

              <button
                onClick={openWaitlist}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-9 py-4 text-sm font-semibold text-[#faf5f0] transition hover:bg-white/[0.08]"
              >
                <span>Request Early Access</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          MODALS: Master Access & Early Access in Linea Espresso (#1b1411)
          ===================================================================== */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-xl"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1411] p-8 shadow-2xl text-[#faf5f0]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#33cc7a]">
                    {modal === 'feature' ? (selectedFeature?.live ? 'Live Pilot Capability' : 'Upcoming Feature') : modal === 'signin' ? 'Master Access' : 'Early Access'}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#faf5f0]">
                    {modal === 'feature' ? selectedFeature?.title : modal === 'signin' ? 'Enter TattvaCo' : 'Join Early Access'}
                  </h3>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="rounded-full p-2 text-[#b8aba3] hover:bg-white/10 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modal === 'signin' && (
                <div className="mt-6">
                  <div className="rounded-2xl border border-[#33cc7a]/30 bg-[#33cc7a]/10 p-4 mb-5">
                    <div className="text-[10px] uppercase font-bold text-[#33cc7a]">Pilot Access Provisioned</div>
                    <p className="mt-1 text-xs text-[#faf5f0]/80">Frictionless access enabled. No password entry required.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#b8aba3] block mb-1">User</label>
                      <input value="TATTVACO" readOnly className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-[#faf5f0] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#b8aba3] block mb-1">Email</label>
                      <input value="KAUSTUBH.D@TATTVACO.COM" readOnly className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-[#faf5f0] outline-none" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      track('master_signin_success');
                      localStorage.setItem('tattava_master_session', JSON.stringify({ name: 'TATTVACO', email: 'KAUSTUBH.D@TATTVACO.COM', role: 'master', signedInAt: new Date().toISOString() }));
                      setModal(null);
                      enterProduct();
                    }}
                    className="mt-6 w-full rounded-full bg-[#33cc7a] px-5 py-3 text-xs font-bold text-[#1b1411] hover:bg-[#2eb76e] transition shadow-lg shadow-[#33cc7a]/30 flex items-center justify-center gap-2"
                  >
                    <span>Enter Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {modal === 'waitlist' && (
                <form
                  className="mt-6 space-y-3.5"
                  onSubmit={(e) => { e.preventDefault(); track('waitlist_submit'); setSubmitted(true); }}
                >
                  {!submitted ? (
                    <>
                      <input required placeholder="Your Name" className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs text-[#faf5f0] outline-none placeholder:text-[#b8aba3]/60 focus:border-[#33cc7a]" />
                      <input required type="email" placeholder="Work Email" className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs text-[#faf5f0] outline-none placeholder:text-[#b8aba3]/60 focus:border-[#33cc7a]" />
                      <select defaultValue="" required className="w-full rounded-full border border-white/10 bg-[#1b1411] px-4 py-3 text-xs text-[#faf5f0]/80 outline-none focus:border-[#33cc7a]">
                        <option value="" disabled>Select Role</option>
                        <option>Writer / Showrunner</option>
                        <option>Director</option>
                        <option>Producer</option>
                        <option>Production Studio</option>
                      </select>
                      <button className="mt-2 w-full rounded-full bg-[#33cc7a] px-5 py-3 text-xs font-bold text-[#1b1411] hover:bg-[#2eb76e] transition shadow-md shadow-[#33cc7a]/30">
                        Request Studio Access
                      </button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-[#33cc7a]/30 bg-[#33cc7a]/10 p-6 text-center">
                      <Check className="mx-auto w-6 h-6 text-[#33cc7a]" />
                      <p className="mt-3 text-sm font-bold text-[#faf5f0]">You are on the list.</p>
                      <p className="mt-1 text-xs text-[#b8aba3]">We will reach out to activate your project workspace.</p>
                    </div>
                  )}
                </form>
              )}

              {modal === 'feature' && selectedFeature && (
                <div className="mt-6">
                  <p className="text-xs sm:text-sm text-[#b8aba3] leading-relaxed">{selectedFeature.description}</p>
                  {selectedFeature.live ? (
                    <button
                      onClick={() => { setModal(null); enterProduct(); }}
                      className="mt-6 w-full rounded-full bg-[#33cc7a] px-5 py-3 text-xs font-bold text-[#1b1411] hover:bg-[#2eb76e] transition flex items-center justify-center gap-2"
                    >
                      <span>Open in Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : !submitted ? (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {['Essential', 'Nice to have', 'Not priority'].map((choice) => (
                        <button
                          key={choice}
                          onClick={() => { track('feature_interest', { feature: selectedFeature.title, choice }); setSubmitted(true); }}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-[#faf5f0] hover:border-[#33cc7a] transition"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-[#33cc7a]/10 p-4 text-xs text-[#33cc7a]">Feedback captured. Thank you.</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
