import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowDown,
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
    accent: 'from-amber-400/20 to-transparent',
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
    accent: 'from-cyan-400/15 to-transparent',
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
    accent: 'from-purple-400/15 to-transparent',
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
    accent: 'from-rose-400/15 to-transparent',
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
  { title: 'Story Doctor', eyebrow: 'ROADMAP', description: 'Deep structural, thematic and pacing diagnostics across the whole project.' },
  { title: 'Visual Development', eyebrow: 'V2 · ROADMAP', description: 'Turn story intelligence into visual language, art direction and references.' },
  { title: 'AI Filmmaking', eyebrow: 'V3 · ROADMAP', description: 'Carry canonical story intent into generated shots, video, sound and assembly.' },
  { title: 'Localization', eyebrow: 'V4 · ROADMAP', description: 'Create culturally adapted versions without losing character or narrative intent.' },
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

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const LandingScreen: React.FC<{ onEnterProduct: () => void }> = ({ onEnterProduct }) => {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.25]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    track('landing_view');
    const timer = window.setInterval(() => setDemoStep((value) => (value + 1) % 4), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const demoSteps = useMemo(() => [
    { label: 'UNDERSTAND', title: 'What is still unresolved?', copy: 'Tattava identifies the creative question that blocks the next meaningful decision.', meta: '1 unresolved question' },
    { label: 'RESEARCH', title: 'What does the evidence say?', copy: 'Research is gathered and connected to the project instead of living in a separate browser tab.', meta: '12 evidence links' },
    { label: 'DIRECTION', title: 'Which story direction do we choose?', copy: 'Candidate directions are compared with character, world and narrative consequences visible.', meta: '3 candidate directions' },
    { label: 'CANON', title: 'What becomes true?', copy: 'The human decision is approved, recorded and carried forward into every future generation.', meta: 'Human approval required' },
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
    <div className="min-h-screen overflow-x-hidden bg-[#0a0c12] text-[#fbf8f3] selection:bg-amber-400/30 selection:text-white">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="tattava-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(245,158,11,.12),transparent_34%)]" />
            <div className="relative flex w-full max-w-4xl flex-col items-center justify-center px-8">
              <motion.img
                src="https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/TattvaCO.png"
                alt="TattvaCo"
                onError={(event) => {
                  event.currentTarget.src = "/tattvaCo-logo.png";
                }}
                initial={{ opacity: 0, scale: 0.82, filter: 'blur(14px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.45, ease: [0.16, 1, 0.3, 1] }}
                className="h-auto w-[min(72vw,680px)] object-contain"
              />
              <motion.div
                initial={{ opacity: 0, y: 22, letterSpacing: '0.55em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '0.18em' }}
                transition={{ delay: 1.05, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                className="-mt-4 text-center text-[11px] font-medium uppercase text-stone-300 sm:text-sm"
              >
                The essence of every story
              </motion.div>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.65, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 h-px w-28 origin-center bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400" style={{ scaleX: progress }} />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-[#0a0c12]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center">
            <img
              src="/tattvaCo-logo.png"
              alt="TattvaCo"
              className="h-10 w-auto max-w-[170px] object-contain transition duration-300 group-hover:opacity-90"
              onError={(event) => {
                event.currentTarget.src = "https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/tattvaCo-logo.png";
              }}
            />
          </button>

          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.16em] text-stone-400 font-medium lg:flex">
            <a href="#product" className="transition hover:text-[#fbf8f3]">Product</a>
            <a href="#roadmap" className="transition hover:text-[#fbf8f3]">V1–V4</a>
            <a href="#intelligence" className="transition hover:text-[#fbf8f3]">Intelligence</a>
            <a href="#models" className="transition hover:text-[#fbf8f3]">Models</a>
            <a href="#studios" className="transition hover:text-[#fbf8f3]">Capabilities</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={openSignin} className="px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-stone-400 font-medium transition hover:text-[#fbf8f3]">Sign in</button>
            <button onClick={openWaitlist} className="rounded-full border border-amber-400/30 bg-amber-400 px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-stone-950 transition hover:bg-amber-300 shadow-md shadow-amber-400/20">Join Early Access</button>
          </div>

          <button className="md:hidden text-stone-300 hover:text-white" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/[0.08] bg-[#0e1119] md:hidden">
              <div className="flex flex-col gap-5 px-5 py-6 text-sm text-stone-300">
                <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
                <a href="#roadmap" onClick={() => setMenuOpen(false)}>V1–V4</a>
                <a href="#intelligence" onClick={() => setMenuOpen(false)}>Intelligence</a>
                <a href="#models" onClick={() => setMenuOpen(false)}>Models</a>
                <button className="text-left" onClick={() => { setMenuOpen(false); openSignin(); }}>Sign in</button>
                <button onClick={() => { setMenuOpen(false); openWaitlist(); }} className="w-fit rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-stone-950">Join Early Access</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[920px] overflow-hidden border-b border-white/[0.08]">
          <div className="absolute inset-0">
            {!videoFailed ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={cinematicImages.set}
                onError={() => setVideoFailed(true)}
                className="h-full w-full object-cover opacity-35"
              >
                <source src="https://cdn.coverr.co/videos/coverr-film-director-s-pov-7972/1080p.mp4" type="video/mp4" />
              </video>
            ) : (
              <img src={cinematicImages.set} alt="" className="h-full w-full object-cover opacity-35" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c12]/80 via-[#0a0c12]/55 to-[#0a0c12]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c12] via-transparent to-[#0a0c12]/80" />
            <div className="absolute left-1/2 top-1/3 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[150px]" />
          </div>

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto flex min-h-[920px] max-w-[1440px] flex-col justify-center px-5 pb-20 pt-32 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl">
              <motion.div variants={reveal} className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-amber-300 font-semibold">
                <div className="linea-btn-wave h-3 text-amber-400">
                  <span className="h-1.5" />
                  <span className="h-3" />
                  <span className="h-2" />
                </div>
                <span>AI-Native Film Development & Production OS</span>
              </motion.div>
              <motion.h1 variants={reveal} className="max-w-5xl text-[clamp(4rem,9vw,9rem)] font-bold leading-[0.84] tracking-[-0.07em] text-[#fbf8f3]">
                Develop stories
                <br />
                <span className="text-stone-400/60 font-light">with an AI that</span>
                <br />
                <span className="text-amber-400">remembers.</span>
              </motion.h1>
              <motion.p variants={reveal} className="mt-9 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
                Tattava turns ideas into researched, structured and continuously grounded story worlds — keeping every creative decision in creator hands.
              </motion.p>
              <motion.div variants={reveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={enterProduct} className="group flex items-center justify-center gap-3 rounded-full bg-[#fbf8f3] px-8 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 shadow-lg shadow-white/10">
                  Start Developing <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <a href="#roadmap" className="flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-[#141824]/60 px-8 py-3.5 text-sm font-medium text-stone-200 backdrop-blur transition hover:border-white/25 hover:bg-[#141824]/90">
                  Explore the system <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 1 }} className="absolute bottom-10 right-5 hidden items-end gap-10 lg:flex">
              <div className="max-w-[210px] text-right text-[10px] uppercase leading-5 tracking-[0.18em] text-stone-400">One persistent intelligence layer from idea to production.</div>
              <ArrowDown className="h-4 w-4 animate-bounce text-stone-400" />
            </motion.div>
          </motion.div>
        </section>

        {/* Product Section */}
        <section id="product" className="relative border-b border-white/[0.08] bg-[#0a0c12] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} className="mb-12 max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">The Architecture</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-6xl">Not another prompt box.<br /><span className="text-stone-400/60 font-light">A story development system.</span></h2>
            </motion.div>

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1119]/90 shadow-2xl shadow-black/80">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(245,158,11,.08),transparent_35%)]" />
              <div className="relative grid min-h-[650px] lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-7 sm:p-10 lg:p-14">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold"><Lock className="h-3 w-3 text-amber-400" /> TATTAVA / RAJYAM</div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live intelligence
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-medium text-stone-400">
                    {['Understand', 'Research', 'Direction', 'Canon'].map((step, i) => (
                      <React.Fragment key={step}>
                        <button
                          onClick={() => setDemoStep(i)}
                          className={`rounded-full px-3 py-1.5 transition ${demoStep === i ? 'bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold' : 'hover:text-[#fbf8f3]'}`}
                        >
                          {String(i + 1).padStart(2, '0')} {step}
                        </button>
                        {i < 3 && <span className="text-stone-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={demoStep} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.35 }} className="mt-12">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-400">{demoSteps[demoStep].label}</p>
                      <h3 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[#fbf8f3] sm:text-5xl">{demoSteps[demoStep].title}</h3>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">{demoSteps[demoStep].copy}</p>
                      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] text-amber-300 font-semibold">
                        {demoSteps[demoStep].meta}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative min-h-[340px] overflow-hidden border-t border-white/[0.08] lg:border-l lg:border-t-0">
                  <img src={cinematicImages.crew} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0e1119] via-[#0e1119]/80 to-[#0e1119]/90" />
                  <div className="relative flex h-full flex-col justify-between p-7 sm:p-10">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                        <Brain className="w-3.5 h-3.5 text-amber-400" /> Story Brain
                      </div>
                      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#141824]/80 p-5 backdrop-blur-xl">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-amber-400 font-semibold">Next unresolved creative question</div>
                        <div className="mt-2.5 text-base leading-6 text-[#fbf8f3] font-medium">Who controls the kingdom when the king disappears?</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {['Known', 'Unknown', 'Evidence', 'Decision'].map((label, i) => (
                        <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#141824]/60 p-3.5">
                          <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-amber-300/80">{label}</div>
                          <div className="mt-1.5 text-xs text-stone-300">{['Festival disappearance', 'Succession authority', '12 linked sources', 'Human approval'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Section */}
        <section id="intelligence" className="border-b border-white/[0.08] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">How Tattava Thinks</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-7xl">The intelligence compounds<br /><span className="text-stone-400/60 font-light">as the project evolves.</span></h2>
            </motion.div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
              {['IDEA', 'UNDERSTAND', 'IDENTIFY UNKNOWN', 'RESEARCH', 'EVIDENCE', 'INSIGHT', 'DIRECTION', 'HUMAN DECISION', 'CANON', 'GENERATE', 'EVALUATE', 'REPAIR'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.035 }} className="group bg-[#0e1119] p-6 transition hover:bg-[#141824]">
                  <div className="text-[9px] font-mono text-stone-500">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-10 text-xs font-bold tracking-[0.15em] text-stone-300 transition group-hover:text-amber-400">{step}</div>
                  <div className="mt-3 h-px w-8 bg-white/10 transition group-hover:w-14 group-hover:bg-amber-400" />
                </motion.div>
              ))}
            </div>

            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {[
                ['01', 'Context over prompts', 'The project remembers the work that happened before this moment.'],
                ['02', 'Evidence before confidence', 'Research, inference and uncertainty stay distinguishable.'],
                ['03', 'Human authority', 'AI proposes. The creative team decides what becomes canon.'],
              ].map(([number, title, copy]) => (
                <motion.div key={number} whileHover={{ y: -4 }} className="rounded-3xl border border-white/[0.08] bg-[#0e1119]/80 p-8 shadow-xl">
                  <div className="text-[10px] tracking-[0.18em] font-mono text-amber-400">{number}</div>
                  <div className="mt-8 text-xl font-bold text-[#fbf8f3] tracking-tight">{title}</div>
                  <p className="mt-3 text-xs leading-6 text-stone-400">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap" className="border-b border-white/[0.08] bg-[#0a0c12] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">The Full System</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-7xl">One intelligence layer.<br /><span className="text-stone-400/60 font-light">Four stages of creation.</span></h2>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-stone-400 font-mono">V1 → V2 → V3 → V4</div>
            </div>

            <div className="mt-16 space-y-4">
              {roadmap.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <motion.article key={stage.id} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay: index * 0.06 }} whileHover={{ y: -3 }} className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1119]/90 shadow-xl">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stage.accent} opacity-30`} />
                    <div className="relative grid lg:grid-cols-[140px_1fr_320px]">
                      <div className="border-b border-white/[0.08] p-7 lg:border-b-0 lg:border-r">
                        <div className="text-5xl font-bold tracking-tight text-[#fbf8f3]">{stage.id}</div>
                        <div className="mt-3 text-[9px] uppercase tracking-[0.2em] font-bold text-amber-400">{stage.eyebrow}</div>
                        <Icon className="mt-10 h-6 w-6 text-stone-500 transition group-hover:text-amber-400" />
                      </div>
                      <div className="p-7 sm:p-10">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold tracking-tight text-[#fbf8f3]">{stage.title}</h3>
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-semibold text-stone-400">{stage.status}</span>
                        </div>
                        <p className="mt-3 max-w-2xl text-xs leading-6 text-stone-400">{stage.description}</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {stage.features.map((feature) => (
                            <span key={feature} className="rounded-full border border-white/[0.08] bg-[#141824]/60 px-3 py-1 text-[10px] text-stone-300">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-white/[0.08] p-7 lg:border-l lg:border-t-0">
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400">Creative Flow</div>
                        <div className="mt-3 text-xs leading-6 text-stone-300">{stage.flow}</div>
                        <div className="mt-6 h-px bg-gradient-to-r from-amber-400/40 to-transparent" />
                        <div className="mt-3 text-[10px] uppercase tracking-[0.16em] font-medium text-stone-500">{index === 0 ? 'Available now in Pilot' : 'Product roadmap'}</div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visual Intelligence Section */}
        <section className="relative overflow-hidden border-b border-white/[0.08] px-5 py-24 lg:px-10 lg:py-32">
          <div className="absolute inset-0">
            <img src={cinematicImages.palace} alt="" className="h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-[#0a0c12]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c12] via-transparent to-[#0a0c12]" />
          </div>
          <div className="relative mx-auto max-w-[1240px]">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">Visual Intelligence</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-6xl">The story becomes<br /><span className="text-amber-400">a world.</span></h2>
                <p className="mt-4 max-w-lg text-xs leading-7 text-stone-300">The same project intelligence that understands narrative reasons through visual language, character designs, mood, locations, and art direction.</p>
              </div>
              <motion.div whileHover={{ scale: 1.01 }} className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1119]/80 p-3 backdrop-blur-xl shadow-2xl">
                <div className="relative aspect-video overflow-hidden rounded-2xl">
                  <img src={cinematicImages.palace} alt="Cinematic story world" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-400">V2 · Story World</div>
                      <div className="mt-1.5 text-base font-bold text-[#fbf8f3]">From narrative intent to visual canon.</div>
                    </div>
                    <div className="rounded-full border border-white/20 bg-black/40 p-3 backdrop-blur"><Play className="h-4 w-4 fill-white text-white" /></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Model Orchestration Section */}
        <section id="models" className="border-b border-white/[0.08] bg-[#0a0c12] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">Model Orchestration</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-6xl">Multiple models.<br /><span className="text-stone-400/60 font-light">One Story Intelligence.</span></h2>
                <p className="mt-4 text-xs leading-7 text-stone-300">Tattava's durable intelligence layer sits above individual LLM providers: project state, retrieval, multi-step reasoning, evidence, workflow orchestration and human approval.</p>
              </div>
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1119]/90 p-8 shadow-2xl">
                <div className="absolute h-72 w-72 rounded-full border border-amber-400/10" />
                <div className="absolute h-52 w-52 rounded-full border border-amber-400/10" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} className="absolute h-80 w-80">
                  <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_22px_rgba(245,158,11,.8)]" />
                  <span className="absolute bottom-8 right-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
                  <span className="absolute bottom-10 left-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.8)]" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }} className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-center shadow-[0_0_80px_rgba(245,158,11,.15)]">
                  <Network className="h-6 w-6 text-amber-400" />
                  <div className="mt-2 text-[10px] font-bold tracking-[0.14em] text-[#fbf8f3]">PROJECT</div>
                  <div className="text-[10px] font-bold tracking-[0.14em] text-[#fbf8f3]">INTELLIGENCE</div>
                </motion.div>
                {[
                  ['REASONING', Brain, 'Narrative decisions', 'left-8 top-8'],
                  ['RESEARCH', Search, 'Evidence synthesis', 'right-8 top-8'],
                  ['WRITING', Wand2, 'Creative generation', 'left-8 bottom-8'],
                  ['EVALUATION', Check, 'Narrative diagnostics', 'right-8 bottom-8'],
                ].map(([title, Icon, sub, pos]) => (
                  <motion.div key={title as string} whileHover={{ y: -4 }} className={`absolute ${pos as string} rounded-2xl border border-white/[0.08] bg-[#141824]/80 p-3.5 backdrop-blur-xl shadow-lg`}>
                    {React.createElement(Icon as React.ElementType, { className: 'h-4 w-4 text-amber-400' })}
                    <div className="mt-2 text-[10px] font-bold tracking-[0.14em] text-[#fbf8f3]">{title as string}</div>
                    <div className="mt-0.5 text-[10px] text-stone-400">{sub as string}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="studios" className="border-b border-white/[0.08] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-400">Explore the System</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fbf8f3] sm:text-6xl">Capabilities, not checklists.</h2>
              </div>
              <p className="max-w-md text-xs leading-6 text-stone-400">Live capabilities open the pilot. Roadmap capabilities represent upcoming pipeline extensions.</p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((feature) => (
                <motion.button key={feature.title} variants={reveal} whileHover={{ y: -4 }} onClick={() => openFeature(feature)} className="group min-h-[220px] rounded-3xl border border-white/[0.08] bg-[#0e1119]/80 p-6 text-left transition hover:border-amber-400/30 hover:bg-[#141824]/60 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className={feature.live ? 'rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-[8px] uppercase tracking-[0.16em] text-emerald-300 font-bold' : 'rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[8px] uppercase tracking-[0.16em] text-stone-400 font-semibold'}>{feature.eyebrow}</span>
                    <ArrowRight className="h-4 w-4 text-stone-500 transition group-hover:translate-x-1 group-hover:text-amber-400" />
                  </div>
                  <div className="mt-10 text-base font-bold text-[#fbf8f3] tracking-tight">{feature.title}</div>
                  <p className="mt-2 text-xs leading-5 text-stone-400">{feature.description}</p>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-[#0a0c12] px-5 py-28 lg:px-10 lg:py-40">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/[0.06] blur-[150px]" />
          <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }} className="relative mx-auto max-w-4xl text-center">
            <Clapperboard className="mx-auto h-8 w-8 text-amber-400" />
            <h2 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight text-[#fbf8f3] sm:text-8xl">Build the project.<br /><span className="text-stone-400/60 font-light">Not another prompt.</span></h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-stone-300">Start with an idea. Keep the research. Make the decision. Build the canon. Carry the intelligence forward.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={enterProduct} className="rounded-full bg-[#fbf8f3] px-8 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 shadow-lg shadow-white/10">Start Developing</button>
              <button onClick={openWaitlist} className="rounded-full border border-white/[0.12] bg-[#141824]/60 px-8 py-3.5 text-sm font-medium text-stone-200 transition hover:border-white/25 hover:bg-[#141824]/90">Join Early Access</button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-5 backdrop-blur-xl" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.35 }} className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0e1119]/95 p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.22em] font-bold text-amber-400">{modal === 'feature' ? (selectedFeature?.live ? 'Pilot capability' : 'Coming soon') : modal === 'signin' ? 'Master access' : 'Early access'}</div>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#fbf8f3]">{modal === 'feature' ? selectedFeature?.title : modal === 'signin' ? 'Enter TattvaCo' : 'Join Early Access'}</h3>
                </div>
                <button onClick={() => setModal(null)} className="rounded-full p-2 text-stone-400 transition hover:bg-white/[0.05] hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              {modal === 'signin' && (
                <div className="mt-6">
                  <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                    <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-amber-400">Pilot Master Access</div>
                    <p className="mt-1 text-xs leading-5 text-stone-300">Direct studio pilot access is provisioned without password entry.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-[0.16em] font-semibold text-stone-400">Name</label>
                      <input value="TATTVACO" readOnly className="w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-2.5 text-xs text-stone-200 outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-[0.16em] font-semibold text-stone-400">Email</label>
                      <input value="KAUSTUBH.D@TATTVACO.COM" readOnly className="w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-2.5 text-xs text-stone-200 outline-none" />
                    </div>
                  </div>
                  <button onClick={() => { track('master_signin_success', { name: 'TATTVACO', email: 'KAUSTUBH.D@TATTVACO.COM' }); localStorage.setItem('tattava_master_session', JSON.stringify({ name: 'TATTVACO', email: 'KAUSTUBH.D@TATTVACO.COM', role: 'master', signedInAt: new Date().toISOString() })); setModal(null); enterProduct(); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-bold text-stone-950 hover:bg-amber-300 transition shadow-md shadow-amber-400/20">
                    Enter TattvaCo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {modal === 'waitlist' && (
                <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); track('waitlist_submit'); setSubmitted(true); }}>
                  {!submitted ? (
                    <>
                      <input required placeholder="Your Full Name" className="w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-3 text-xs text-[#fbf8f3] outline-none placeholder:text-stone-500 focus:border-amber-400" />
                      <input required type="email" placeholder="Work Email" className="w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-3 text-xs text-[#fbf8f3] outline-none placeholder:text-stone-500 focus:border-amber-400" />
                      <select defaultValue="" required className="w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-3 text-xs text-stone-300 outline-none focus:border-amber-400">
                        <option value="" disabled>Select Role</option><option>Writer</option><option>Director</option><option>Producer</option><option>Production House</option><option>Studio Executive</option><option>Other</option>
                      </select>
                      <button className="mt-2 w-full rounded-full bg-amber-400 px-5 py-3 text-xs font-bold text-stone-950 hover:bg-amber-300 transition shadow-md shadow-amber-400/20">Request Early Access</button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
                      <Check className="mx-auto h-6 w-6 text-emerald-400" />
                      <p className="mt-3 text-sm font-bold text-[#fbf8f3]">You're on the list.</p>
                      <p className="mt-1 text-xs text-stone-400">Thanks for helping shape TattvaCo.</p>
                    </div>
                  )}
                </form>
              )}

              {modal === 'feature' && selectedFeature && (
                <div className="mt-6">
                  <p className="text-xs leading-6 text-stone-300">{selectedFeature.description}</p>
                  {selectedFeature.live ? (
                    <button onClick={() => { setModal(null); enterProduct(); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#fbf8f3] px-5 py-3 text-xs font-bold text-stone-950 hover:bg-amber-300 transition shadow-md">
                      Open TattvaCo <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : !submitted ? (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {['Definitely', 'Maybe', 'Not yet'].map((choice) => (
                        <button key={choice} onClick={() => { track('feature_interest', { feature: selectedFeature.title, choice }); setSubmitted(true); }} className="rounded-full border border-white/[0.08] bg-[#141824]/60 px-3 py-2.5 text-xs text-stone-300 transition hover:border-amber-400/30 hover:text-white">
                          {choice}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">Signal captured. We appreciate your feedback.</div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
