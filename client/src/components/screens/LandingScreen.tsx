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
    accent: 'from-amber-200/20 to-transparent',
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
    accent: 'from-cyan-200/15 to-transparent',
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
    accent: 'from-violet-200/15 to-transparent',
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
    accent: 'from-rose-200/15 to-transparent',
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
    <div className="min-h-screen overflow-x-hidden bg-[#050608] text-white selection:bg-amber-200/30 selection:text-white">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="tattava-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(173,75,40,.10),transparent_34%)]" />
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
                className="-mt-4 text-center text-[11px] font-medium uppercase text-white/70 sm:text-sm"
              >
                The essence of every story
              </motion.div>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.65, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 h-px w-28 origin-center bg-gradient-to-r from-transparent via-[#ad4b28] to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="fixed left-0 right-0 top-0 z-[70] h-px origin-left bg-amber-200" style={{ scaleX: progress }} />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.07] bg-[#050608]/65 backdrop-blur-2xl">
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

          <nav className="hidden items-center gap-8 text-[12px] uppercase tracking-[0.13em] text-white/45 lg:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#roadmap" className="transition hover:text-white">V1–V4</a>
            <a href="#intelligence" className="transition hover:text-white">Intelligence</a>
            <a href="#models" className="transition hover:text-white">Models</a>
            <a href="#studios" className="transition hover:text-white">Studios</a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button onClick={openSignin} className="px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-white/55 transition hover:text-white">Sign in</button>
            <button onClick={openWaitlist} className="rounded-full border border-amber-100/30 bg-amber-100 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-black transition hover:bg-white">Join Early Access</button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/[0.07] bg-[#07090c] md:hidden">
              <div className="flex flex-col gap-5 px-5 py-6 text-sm text-white/65">
                <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
                <a href="#roadmap" onClick={() => setMenuOpen(false)}>V1–V4</a>
                <a href="#intelligence" onClick={() => setMenuOpen(false)}>Intelligence</a>
                <a href="#models" onClick={() => setMenuOpen(false)}>Models</a>
                <button className="text-left" onClick={() => { setMenuOpen(false); openSignin(); }}>Sign in</button>
                <button onClick={() => { setMenuOpen(false); openWaitlist(); }} className="w-fit rounded-full bg-amber-100 px-5 py-2.5 text-sm font-medium text-black">Join Early Access</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative min-h-[920px] overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0">
            {!videoFailed ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={cinematicImages.set}
                onError={() => setVideoFailed(true)}
                className="h-full w-full object-cover opacity-45"
              >
                <source src="https://cdn.coverr.co/videos/coverr-film-director-s-pov-7972/1080p.mp4" type="video/mp4" />
              </video>
            ) : (
              <img src={cinematicImages.set} alt="" className="h-full w-full object-cover opacity-45" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/80 via-[#050608]/55 to-[#050608]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-transparent to-[#050608]/75" />
            <div className="absolute left-1/2 top-1/3 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-amber-200/[0.08] blur-[150px]" />
          </div>

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto flex min-h-[920px] max-w-[1440px] flex-col justify-center px-5 pb-20 pt-32 lg:px-10">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl">
              <motion.div variants={reveal} className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-amber-100/70">
                <span className="h-px w-10 bg-amber-100/50" />
                AI-NATIVE FILM DEVELOPMENT & PRODUCTION
              </motion.div>
              <motion.h1 variants={reveal} className="max-w-5xl text-[clamp(4rem,9vw,9rem)] font-medium leading-[0.84] tracking-[-0.07em]">
                Develop stories
                <br />
                <span className="text-white/35">with an AI that</span>
                <br />
                <span className="text-amber-100">remembers.</span>
              </motion.h1>
              <motion.p variants={reveal} className="mt-9 max-w-2xl text-base leading-7 text-white/52 sm:text-lg">
                Tattava turns ideas into researched, structured and continuously grounded story worlds — while keeping the creative decision in your hands.
              </motion.p>
              <motion.div variants={reveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={enterProduct} className="group flex items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-amber-100">
                  Start Developing <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <a href="#roadmap" className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm text-white/75 backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]">
                  Explore the system <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 1 }} className="absolute bottom-10 right-5 hidden items-end gap-10 lg:flex">
              <div className="max-w-[210px] text-right text-[10px] uppercase leading-5 tracking-[0.18em] text-white/30">One persistent intelligence layer from idea to production.</div>
              <ArrowDown className="h-4 w-4 animate-bounce text-white/35" />
            </motion.div>
          </motion.div>
        </section>

        <section id="product" className="relative border-b border-white/[0.06] bg-[#07090c] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} className="mb-12 max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">The product</p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Not another prompt box.<br /><span className="text-white/35">A story development system.</span></h2>
            </motion.div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0f13] shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,225,150,.08),transparent_35%)]" />
              <div className="relative grid min-h-[650px] lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-7 sm:p-10 lg:p-14">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30"><Lock className="h-3 w-3" /> TATTAVA / RAJYAM</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/65">Live intelligence</div>
                  </div>

                  <div className="mt-12 flex items-center gap-2 overflow-hidden text-[9px] uppercase tracking-[0.18em] text-white/25">
                    {['Understand', 'Research', 'Direction', 'Canon'].map((step, i) => (
                      <React.Fragment key={step}>
                        <button onClick={() => setDemoStep(i)} className={demoStep === i ? 'text-amber-100' : 'transition hover:text-white/55'}>{String(i + 1).padStart(2, '0')} {step}</button>
                        {i < 3 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={demoStep} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.35 }} className="mt-14">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{demoSteps[demoStep].label}</p>
                      <h3 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-0.035em] sm:text-5xl">{demoSteps[demoStep].title}</h3>
                      <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">{demoSteps[demoStep].copy}</p>
                      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-100/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-amber-100/70">{demoSteps[demoStep].meta}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative min-h-[340px] overflow-hidden border-t border-white/[0.08] lg:border-l lg:border-t-0">
                  <img src={cinematicImages.crew} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0b0e12] via-[#0b0e12]/65 to-[#0b0e12]/85" />
                  <div className="relative flex h-full flex-col justify-between p-7 sm:p-10">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Story Brain</div>
                      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-amber-100/65">Next unresolved creative question</div>
                        <div className="mt-3 text-lg leading-7 text-white/80">Who controls the kingdom when the king disappears?</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Known', 'Unknown', 'Evidence', 'Decision'].map((label, i) => (
                        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                          <div className="text-[9px] uppercase tracking-[0.18em] text-amber-100/55">{label}</div>
                          <div className="mt-2 text-[11px] leading-5 text-white/40">{['Festival disappearance', 'Succession authority', '12 linked sources', 'Human approval'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="intelligence" className="border-b border-white/[0.06] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.p variants={reveal} className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">How Tattava thinks</motion.p>
              <motion.h2 variants={reveal} className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-7xl">The intelligence compounds<br /><span className="text-white/30">as the project evolves.</span></motion.h2>
            </motion.div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {['IDEA', 'UNDERSTAND', 'IDENTIFY UNKNOWN', 'RESEARCH', 'EVIDENCE', 'INSIGHT', 'DIRECTION', 'HUMAN DECISION', 'CANON', 'GENERATE', 'EVALUATE', 'REPAIR'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.035 }} className="group bg-[#080a0d] p-6 transition hover:bg-[#0d1015]">
                  <div className="text-[9px] text-white/20">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-12 text-xs font-medium tracking-[0.15em] text-white/65 transition group-hover:text-amber-100">{step}</div>
                  <div className="mt-3 h-px w-8 bg-white/10 transition group-hover:w-14 group-hover:bg-amber-100/50" />
                </motion.div>
              ))}
            </div>

            <div className="mt-20 grid gap-5 lg:grid-cols-3">
              {[
                ['01', 'Context over prompts', 'The project remembers the work that happened before this moment.'],
                ['02', 'Evidence before confidence', 'Research, inference and uncertainty stay distinguishable.'],
                ['03', 'Human authority', 'AI proposes. The creative team decides what becomes canon.'],
              ].map(([number, title, copy]) => (
                <motion.div key={number} whileHover={{ y: -6 }} className="rounded-2xl border border-white/10 bg-[#0a0c10] p-7">
                  <div className="text-[10px] tracking-[0.18em] text-amber-100/60">{number}</div>
                  <div className="mt-12 text-xl font-medium">{title}</div>
                  <p className="mt-3 text-sm leading-6 text-white/40">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="border-b border-white/[0.06] bg-[#07090c] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">The full product</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-7xl">One intelligence layer.<br /><span className="text-white/30">Four stages of creation.</span></h2>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/25">V1 → V2 → V3 → V4</div>
            </div>

            <div className="mt-16 space-y-4">
              {roadmap.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <motion.article key={stage.id} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay: index * 0.06 }} whileHover={{ y: -3 }} className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0e12]">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stage.accent} opacity-50`} />
                    <div className="relative grid lg:grid-cols-[140px_1fr_320px]">
                      <div className="border-b border-white/10 p-7 lg:border-b-0 lg:border-r">
                        <div className="text-5xl font-medium tracking-[-0.06em]">{stage.id}</div>
                        <div className="mt-4 text-[9px] uppercase tracking-[0.2em] text-amber-100/55">{stage.eyebrow}</div>
                        <Icon className="mt-12 h-5 w-5 text-white/25 transition group-hover:text-amber-100/70" />
                      </div>
                      <div className="p-7 sm:p-10">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-3xl font-medium tracking-[-0.035em]">{stage.title}</h3>
                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white/35">{stage.status}</span>
                        </div>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">{stage.description}</p>
                        <div className="mt-8 flex flex-wrap gap-2">
                          {stage.features.map((feature) => <span key={feature} className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] text-white/45">{feature}</span>)}
                        </div>
                      </div>
                      <div className="border-t border-white/10 p-7 lg:border-l lg:border-t-0">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">Creative flow</div>
                        <div className="mt-5 text-sm leading-7 text-white/55">{stage.flow}</div>
                        <div className="mt-8 h-px bg-gradient-to-r from-amber-100/40 to-transparent" />
                        <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-white/25">{index === 0 ? 'Available now' : 'Product roadmap'}</div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-white/[0.06] px-5 py-24 lg:px-10 lg:py-32">
          <div className="absolute inset-0">
            <img src={cinematicImages.palace} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-[#050608]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-transparent to-[#050608]" />
          </div>
          <div className="relative mx-auto max-w-[1240px]">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">Visual intelligence</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">The story becomes<br /><span className="text-amber-100">a world.</span></h2>
                <p className="mt-6 max-w-lg text-sm leading-7 text-white/45">The same project intelligence that understands the narrative can eventually understand the visual language, characters, locations and production intent.</p>
              </div>
              <motion.div whileHover={{ scale: 1.01 }} className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl">
                <div className="relative aspect-video overflow-hidden rounded-2xl">
                  <img src={cinematicImages.palace} alt="Cinematic story world" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-amber-100/65">V2 · Story World</div>
                      <div className="mt-2 text-lg">From narrative intent to visual language.</div>
                    </div>
                    <div className="rounded-full border border-white/20 bg-black/30 p-3 backdrop-blur"><Play className="h-4 w-4 fill-white" /></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="models" className="border-b border-white/[0.06] bg-[#07090c] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">Model orchestration</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Multiple models.<br /><span className="text-white/30">One Story Intelligence.</span></h2>
                <p className="mt-6 text-sm leading-7 text-white/45">Tattava's durable layer sits above individual models: project state, retrieval, reasoning, evidence, workflow orchestration and human approval.</p>
              </div>
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#090b0f] p-8">
                <div className="absolute h-72 w-72 rounded-full border border-amber-100/10" />
                <div className="absolute h-52 w-52 rounded-full border border-amber-100/10" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} className="absolute h-80 w-80">
                  <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_22px_rgba(255,231,170,.8)]" />
                  <span className="absolute bottom-8 right-2 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,.8)]" />
                  <span className="absolute bottom-10 left-2 h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_18px_rgba(221,214,254,.8)]" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }} className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/[0.05] text-center shadow-[0_0_80px_rgba(255,220,150,.08)]">
                  <Network className="h-6 w-6 text-amber-100" />
                  <div className="mt-3 text-[10px] font-medium tracking-[0.14em]">PROJECT</div>
                  <div className="text-[10px] font-medium tracking-[0.14em]">INTELLIGENCE</div>
                </motion.div>
                {[
                  ['REASONING', Brain, 'Narrative decisions', 'left-10 top-10'],
                  ['RESEARCH', Search, 'Evidence synthesis', 'right-10 top-10'],
                  ['WRITING', Wand2, 'Creative generation', 'left-10 bottom-10'],
                  ['EVALUATION', Check, 'Narrative diagnostics', 'right-10 bottom-10'],
                ].map(([title, Icon, sub, pos]) => (
                  <motion.div key={title as string} whileHover={{ y: -4 }} className={`absolute ${pos as string} rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl`}>
                    {React.createElement(Icon as React.ElementType, { className: 'h-4 w-4 text-amber-100/70' })}
                    <div className="mt-3 text-[9px] font-medium tracking-[0.14em]">{title as string}</div>
                    <div className="mt-1 text-[10px] text-white/30">{sub as string}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="studios" className="border-b border-white/[0.06] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100/65">Explore the system</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Capabilities, not feature checklists.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/35">Live capabilities open the pilot. Roadmap capabilities are transparent validation doors.</p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((feature) => (
                <motion.button key={feature.title} variants={reveal} whileHover={{ y: -6 }} onClick={() => openFeature(feature)} className="group min-h-[220px] rounded-2xl border border-white/10 bg-[#090b0f] p-6 text-left transition hover:border-amber-100/20">
                  <div className="flex items-center justify-between">
                    <span className={feature.live ? 'rounded-full bg-emerald-300/10 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-emerald-200' : 'rounded-full bg-white/[0.05] px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white/30'}>{feature.eyebrow}</span>
                    <ArrowRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-amber-100" />
                  </div>
                  <div className="mt-12 text-base font-medium">{feature.title}</div>
                  <p className="mt-3 text-xs leading-5 text-white/35">{feature.description}</p>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#07090c] px-5 py-28 lg:px-10 lg:py-40">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/[0.06] blur-[150px]" />
          <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }} className="relative mx-auto max-w-4xl text-center">
            <Clapperboard className="mx-auto h-7 w-7 text-amber-100/75" />
            <h2 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-8xl">Build the project.<br /><span className="text-white/30">Not another prompt.</span></h2>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">Start with an idea. Keep the research. Make the decision. Build the canon. Carry the intelligence forward.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={enterProduct} className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-amber-100">Start Developing</button>
              <button onClick={openWaitlist} className="rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/[0.07]">Join Early Access</button>
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-5 backdrop-blur-xl" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.35 }} className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#101318] p-7 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.22em] text-amber-100/65">{modal === 'feature' ? (selectedFeature?.live ? 'Pilot capability' : 'Coming soon') : modal === 'signin' ? 'Master access' : 'Early access'}</div>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">{modal === 'feature' ? selectedFeature?.title : modal === 'signin' ? 'Enter Tattava' : 'Join Tattava Early Access'}</h3>
                </div>
                <button onClick={() => setModal(null)} className="rounded-lg p-2 text-white/35 transition hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              {modal === 'signin' && (
                <div className="mt-7">
                  <div className="mb-5 rounded-2xl border border-amber-100/15 bg-amber-100/[0.04] p-4">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-amber-100/65">Pilot master access</div>
                    <p className="mt-2 text-xs leading-5 text-white/35">Current pilot access is frictionless. No password is required.</p>
                  </div>
                  <div className="space-y-3">
                    <div><label className="mb-1.5 block text-[9px] uppercase tracking-[0.16em] text-white/25">Name</label><input value="TATTVACO" readOnly className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 outline-none" /></div>
                    <div><label className="mb-1.5 block text-[9px] uppercase tracking-[0.16em] text-white/25">Email</label><input value="KAUSTUBH.D@TATTVACO.COM" readOnly className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 outline-none" /></div>
                  </div>
                  <button onClick={() => { track('master_signin_success', { name: 'TATTVACO', email: 'KAUSTUBH.D@TATTVACO.COM' }); localStorage.setItem('tattava_master_session', JSON.stringify({ name: 'TATTVACO', email: 'KAUSTUBH.D@TATTVACO.COM', role: 'master', signedInAt: new Date().toISOString() })); setModal(null); enterProduct(); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-100 px-4 py-3.5 text-sm font-medium text-black hover:bg-white">Enter Tattava <ArrowRight className="h-4 w-4" /></button>
                </div>
              )}

              {modal === 'waitlist' && (
                <form className="mt-7 space-y-3" onSubmit={(e) => { e.preventDefault(); track('waitlist_submit'); setSubmitted(true); }}>
                  {!submitted ? (
                    <>
                      <input required placeholder="Name" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none placeholder:text-white/25 focus:border-amber-100/40" />
                      <input required type="email" placeholder="Work email" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none placeholder:text-white/25 focus:border-amber-100/40" />
                      <select defaultValue="" required className="w-full rounded-xl border border-white/10 bg-[#101318] px-4 py-3.5 text-sm text-white/60 outline-none focus:border-amber-100/40">
                        <option value="" disabled>Role</option><option>Writer</option><option>Director</option><option>Producer</option><option>Production House</option><option>Studio</option><option>Other</option>
                      </select>
                      <button className="mt-2 w-full rounded-xl bg-amber-100 px-4 py-3.5 text-sm font-medium text-black hover:bg-white">Join Early Access</button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200/10 bg-emerald-200/[0.04] p-6 text-center"><Check className="mx-auto h-5 w-5 text-emerald-200" /><p className="mt-3 text-sm">You're on the list.</p><p className="mt-1 text-xs text-white/35">Thanks for helping shape Tattava.</p></div>
                  )}
                </form>
              )}

              {modal === 'feature' && selectedFeature && (
                <div className="mt-7">
                  <p className="text-sm leading-7 text-white/45">{selectedFeature.description}</p>
                  {selectedFeature.live ? (
                    <button onClick={() => { setModal(null); enterProduct(); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-black">Open Tattava <ArrowRight className="h-4 w-4" /></button>
                  ) : !submitted ? (
                    <div className="mt-6 grid grid-cols-3 gap-2">{['Definitely', 'Maybe', 'Not yet'].map((choice) => <button key={choice} onClick={() => { track('feature_interest', { feature: selectedFeature.title, choice }); setSubmitted(true); }} className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/55 transition hover:border-amber-100/30 hover:text-white">{choice}</button>)}</div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-emerald-200/10 bg-emerald-200/[0.04] p-4 text-sm text-emerald-100">Signal captured.</div>
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
