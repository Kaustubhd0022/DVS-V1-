import React, { useState } from 'react';
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Clapperboard,
  Database,
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
} from 'lucide-react';

type ModalMode = 'signin' | 'waitlist' | 'feature' | null;

type Feature = {
  title: string;
  description: string;
  live?: boolean;
};

const roadmap = [
  {
    id: 'V1',
    eyebrow: 'NARRATIVE INTELLIGENCE',
    title: 'Story Development Copilot',
    description: 'Turn an initial idea into a researched, reasoned and human-approved story development package.',
    flow: 'Idea → Story Brain → Research → Story → Screenplay → Canon → Evaluation',
    status: 'Available in pilot',
    icon: Brain,
    features: ['Project Intelligence', 'Story Brain', 'Research & Evidence', 'Character Intelligence', 'Narrative Reasoning', 'Screenplay & Dialogue', 'Canon & Continuity', 'Evaluation → Repair'],
  },
  {
    id: 'V2',
    eyebrow: 'VISUAL INTELLIGENCE',
    title: 'Story to Visualisation',
    description: 'Carry the same project intelligence into detailed story-world and visual development.',
    flow: 'Story → Character World → Art Direction → References → Storyboards',
    status: 'Roadmap',
    icon: Layers3,
    features: ['Story World', 'Character Visual Development', 'Locations & Visual References', 'Art Direction', 'Concept Development', 'Storyboarding'],
  },
  {
    id: 'V3',
    eyebrow: 'GENAI PRODUCTION',
    title: 'AI Filmmaking Layer',
    description: 'Move from a structured visualised story world toward AI-generated film and video output.',
    flow: 'Visualisation → Shots → Video → Sound → Assembly → QC',
    status: 'Roadmap',
    icon: Film,
    features: ['Shot Planning', 'AI Visual Generation', 'Video Generation', 'Sound & Performance', 'Assembly & Editing', 'Human Approval & QC'],
  },
  {
    id: 'V4',
    eyebrow: 'LOCALIZATION & ADAPTATION',
    title: 'Original to Versions',
    description: 'Adapt the original project across languages, cultures and regional contexts while preserving canon.',
    flow: 'Original → Cultural Adaptation → Language → Dialogue → Performance → Visual Adaptation',
    status: 'Roadmap',
    icon: Globe2,
    features: ['Language Intelligence', 'Cultural Context', 'Character Voice', 'Regional Idiom', 'Subtitles & Dubbing', 'Lip-sync & Adaptation Rules'],
  },
];

const liveFeatures: Feature[] = [
  { title: 'Story Brain', description: 'A persistent intelligence layer that remembers the project.', live: true },
  { title: 'Research & Evidence', description: 'Traceable research connected to sources, findings and project relevance.', live: true },
  { title: 'Character Intelligence', description: 'Characters, relationships, motivations and decisions stay connected.', live: true },
  { title: 'Narrative Reasoning', description: 'Explore competing directions before making a creative decision.', live: true },
  { title: 'Canon & Continuity', description: 'Approved decisions become project truth and contradictions become visible.', live: true },
  { title: 'Evaluation → Repair', description: 'Diagnose issues, propose repairs, regenerate and re-evaluate.', live: true },
  { title: 'Advanced Story Doctor', description: 'Deeper structural and thematic diagnosis across the project.' },
  { title: 'Visual Development', description: 'Carry narrative intelligence into art direction and visual development.' },
  { title: 'AI Filmmaking', description: 'Generate and assemble visual content from an approved story world.' },
  { title: 'Localization', description: 'Create culturally adapted versions without losing canonical intent.' },
];

function track(event: string, properties: Record<string, string> = {}) {
  try {
    const key = 'tattava_marketing_events';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push({ event, properties, timestamp: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(current.slice(-250)));
  } catch {
    // Marketing analytics should never block the product experience.
  }
}

export const LandingScreen: React.FC<{ onEnterProduct: () => void }> = ({ onEnterProduct }) => {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#080a0d] text-white overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080a0d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/10">
              <Sparkles className="h-4 w-4 text-amber-200" />
            </div>
            <span className="text-sm font-semibold tracking-[0.28em]">TATTAVA</span>
          </button>

          <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
            <a href="#product" className="hover:text-white">Product</a>
            <a href="#roadmap" className="hover:text-white">V1–V4</a>
            <a href="#intelligence" className="hover:text-white">Intelligence</a>
            <a href="#models" className="hover:text-white">Models</a>
            <a href="#studios" className="hover:text-white">For Studios</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => { track('login_clicked'); setModal('signin'); }} className="px-3 py-2 text-sm text-white/70 hover:text-white">Sign in</button>
            <button onClick={openWaitlist} className="rounded-full border border-amber-200/30 bg-amber-200 px-4 py-2 text-sm font-medium text-black hover:bg-amber-100">Join Early Access</button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/[0.08] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4 text-sm text-white/70">
              <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
              <a href="#roadmap" onClick={() => setMenuOpen(false)}>V1–V4</a>
              <a href="#intelligence" onClick={() => setMenuOpen(false)}>Intelligence</a>
              <a href="#models" onClick={() => setMenuOpen(false)}>Models</a>
              <button className="text-left" onClick={() => { setMenuOpen(false); setModal('signin'); }}>Sign in</button>
              <button onClick={() => { setMenuOpen(false); openWaitlist(); }} className="w-fit rounded-full bg-amber-200 px-4 py-2 font-medium text-black">Join Early Access</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-amber-200/[0.07] blur-[120px]" />
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                AI-NATIVE FILM DEVELOPMENT & PRODUCTION
              </div>
              <h1 className="text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Develop stories with an AI that <span className="text-amber-200">remembers.</span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                Tattava turns an idea into a researched, reasoned and continuously grounded story world — while keeping creative decisions in human hands.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={enterProduct} className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-amber-100">
                  Start Developing <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <a href="#roadmap" className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-white/75 hover:bg-white/[0.05]">
                  Explore V1–V4 <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div id="product" className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d1015] shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-white/45"><div className="h-2 w-2 rounded-full bg-red-300/60" /><div className="h-2 w-2 rounded-full bg-amber-200/60" /><div className="h-2 w-2 rounded-full bg-emerald-300/60" /> TATTAVA / RAJYAM</div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30"><Lock className="h-3 w-3" /> Project Intelligence</div>
              </div>
              <div className="grid min-h-[390px] lg:grid-cols-[1fr_340px]">
                <div className="p-6 sm:p-10">
                  <div className="mb-10 flex items-center gap-3 text-xs text-white/35">
                    <span className="text-amber-200">01</span> UNDERSTAND
                    <span>→</span><span>02</span> RESEARCH
                    <span>→</span><span>03</span> DIRECTION
                    <span>→</span><span>04</span> CANON
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Next unresolved creative question</p>
                  <h3 className="mt-4 max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl">Who controls the kingdom when the king disappears?</h3>
                  <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="flex gap-3">
                      <Search className="mt-0.5 h-4 w-4 text-amber-200" />
                      <div>
                        <p className="text-sm text-white/80">Tattava identified an unresolved authority question.</p>
                        <p className="mt-1 text-xs leading-5 text-white/40">3 candidate directions · 12 evidence links · 1 decision waiting for approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Evidence-backed options', 'Character impact', 'Canon dependency'].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/45">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 bg-black/15 p-6 lg:border-l lg:border-t-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Story Brain</div>
                  <div className="mt-6 space-y-4">
                    {[
                      ['Known', 'King disappeared after the harvest festival'],
                      ['Unknown', 'Who has legitimate succession authority?'],
                      ['Evidence', 'Historical succession patterns + project research'],
                      ['Decision', 'Human approval required'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">{label}</div>
                        <div className="mt-1 text-xs leading-5 text-white/55">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="intelligence" className="border-y border-white/[0.07] bg-white/[0.015] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">The intelligence loop</p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Tattava doesn't just generate. It develops.</h2>
              <p className="mt-5 text-base leading-7 text-white/50">The project gets smarter as the team moves forward. Research, decisions, canon and dependencies remain connected instead of disappearing into isolated prompts.</p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {['IDEA', 'UNDERSTAND', 'IDENTIFY UNKNOWN', 'RESEARCH', 'EVIDENCE', 'INSIGHT', 'CREATIVE DIRECTION', 'HUMAN DECISION', 'CANON', 'GENERATE', 'EVALUATE', 'REPAIR', 'REGENERATE', 'RE-EVALUATE', 'APPROVE', 'CANON'].map((step, i) => (
                <div key={i} className="bg-[#0b0e12] p-5">
                  <div className="text-[10px] text-white/25">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-5 text-sm font-medium tracking-wide text-white/75">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">One product. Four creative stages.</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">From idea to versions.</h2>
                <p className="mt-5 text-white/50">Tattava progressively carries the same Project Intelligence Layer from narrative development into visualisation, AI filmmaking and localization.</p>
              </div>
              <div className="text-sm text-white/35">V1 → V2 → V3 → V4</div>
            </div>

            <div className="mt-12 space-y-4">
              {roadmap.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <article key={stage.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f13]">
                    <div className="grid lg:grid-cols-[150px_1fr_320px]">
                      <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
                        <div className="text-4xl font-medium text-white/90">{stage.id}</div>
                        <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-amber-200/60">{stage.eyebrow}</div>
                        <Icon className="mt-10 h-5 w-5 text-white/25" />
                      </div>
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-medium tracking-tight">{stage.title}</h3>
                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/35">{stage.status}</span>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{stage.description}</p>
                        <div className="mt-6 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-xs text-white/45">{stage.flow}</div>
                      </div>
                      <div className="border-t border-white/10 p-6 lg:border-l lg:border-t-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">Capability surface</div>
                        <div className="mt-4 grid grid-cols-1 gap-2">
                          {stage.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-xs text-white/55">
                              <Check className="h-3.5 w-3.5 text-emerald-200/70" /> {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < roadmap.length - 1 && <div className="h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="models" className="border-y border-white/[0.07] bg-[#0b0e12] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">Model orchestration</p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Multiple AI models. One Story Intelligence.</h2>
              <p className="mt-5 text-sm leading-7 text-white/50">Tattava's durable value sits above individual models: project state, retrieval, reasoning, workflow orchestration, evidence and human approval.</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-5 sm:p-8">
              <div className="mb-7 text-center text-xs uppercase tracking-[0.2em] text-amber-200/70">TATTAVA INTELLIGENCE</div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: 'REASONING', sub: 'Narrative decisions', Icon: Brain },
                  { title: 'RESEARCH', sub: 'Evidence synthesis', Icon: Search },
                  { title: 'WRITING', sub: 'Creative generation', Icon: Sparkles },
                ].map(({ title, sub, Icon }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-center">
                    <Icon className="mx-auto h-5 w-5 text-amber-200/70" />
                    <div className="mt-3 text-xs font-medium">{title}</div>
                    <div className="mt-1 text-[11px] text-white/35">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="mx-auto my-4 h-8 w-px bg-gradient-to-b from-white/10 to-amber-200/40" />
              <div className="rounded-xl border border-amber-200/20 bg-amber-200/[0.04] p-5 text-center">
                <Network className="mx-auto h-5 w-5 text-amber-200" />
                <div className="mt-3 text-sm font-medium">PROJECT INTELLIGENCE LAYER</div>
                <div className="mt-1 text-xs text-white/35">Story Brain · Context · Canon · Evidence · Dependencies</div>
              </div>
            </div>
          </div>
        </section>

        <section id="studios" className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">Explore the product</p>
                <h2 className="mt-4 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Capabilities you can test today — and tomorrow.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/40">Roadmap features are deliberately presented as transparent validation doors. Your interest becomes product-discovery data.</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {liveFeatures.map((feature) => (
                <button key={feature.title} onClick={() => openFeature(feature)} className="group text-left rounded-2xl border border-white/10 bg-[#0c0f13] p-5 transition hover:-translate-y-0.5 hover:border-amber-200/25 hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between">
                    <span className={feature.live ? 'rounded-full bg-emerald-300/10 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-200' : 'rounded-full bg-white/[0.05] px-2 py-1 text-[9px] uppercase tracking-wider text-white/35'}>{feature.live ? 'Pilot' : 'Coming soon'}</span>
                    <ArrowRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-amber-200" />
                  </div>
                  <div className="mt-8 text-sm font-medium">{feature.title}</div>
                  <div className="mt-2 text-xs leading-5 text-white/40">{feature.description}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.07] bg-amber-100/[0.025] px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Clapperboard className="mx-auto h-7 w-7 text-amber-200/80" />
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Build the project. Not another prompt.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/45">Start with an idea. Keep the research. Make the decision. Build the canon. Carry the intelligence forward.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={enterProduct} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-amber-100">Open Tattava</button>
              <button onClick={openWaitlist} className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/70 hover:bg-white/[0.05]">Join Early Access</button>
            </div>
          </div>
        </section>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101318] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">{modal === 'feature' ? (selectedFeature?.live ? 'Pilot capability' : 'Coming soon') : modal === 'signin' ? 'Tattava access' : 'Early access'}</div>
                <h3 className="mt-2 text-xl font-medium">{modal === 'feature' ? selectedFeature?.title : modal === 'signin' ? 'Sign in to Tattava' : 'Join Tattava Early Access'}</h3>
              </div>
              <button onClick={() => setModal(null)} className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {modal === 'feature' && selectedFeature && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-white/50">{selectedFeature.description}</p>
                {selectedFeature.live ? (
                  <button onClick={() => { setModal(null); enterProduct(); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black">Open Tattava <ArrowRight className="h-4 w-4" /></button>
                ) : (
                  <>
                    <p className="mt-6 text-xs leading-5 text-white/35">This capability is not presented as live. We're validating which future workflows matter most to creative teams.</p>
                    {!submitted ? (
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {['Definitely', 'Maybe', 'Not yet'].map((choice) => (
                          <button key={choice} onClick={() => { track('feature_interest', { feature: selectedFeature.title, choice }); setSubmitted(true); }} className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/60 hover:border-amber-200/30 hover:text-white">{choice}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-emerald-200/10 bg-emerald-200/[0.04] p-4 text-sm text-emerald-100">Thanks. Your signal has been captured for product discovery.</div>
                    )}
                  </>
                )}
              </div>
            )}

            {modal === 'signin' && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-white/50">Pilot access is currently provisioned for invited users.</p>
                <button onClick={() => { setModal(null); openWaitlist(); }} className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black">Request access</button>
              </div>
            )}

            {modal === 'waitlist' && (
              <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); track('waitlist_submit'); setSubmitted(true); }}>
                {!submitted ? (
                  <>
                    <input required placeholder="Name" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-amber-200/40" />
                    <input required type="email" placeholder="Work email" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-amber-200/40" />
                    <select defaultValue="" required className="w-full rounded-xl border border-white/10 bg-[#101318] px-4 py-3 text-sm text-white/60 outline-none focus:border-amber-200/40">
                      <option value="" disabled>Role</option>
                      <option>Writer</option><option>Director</option><option>Producer</option><option>Production House</option><option>Studio</option><option>Other</option>
                    </select>
                    <button className="mt-2 w-full rounded-xl bg-amber-200 px-4 py-3 text-sm font-medium text-black hover:bg-amber-100">Join Early Access</button>
                  </>
                ) : (
                  <div className="rounded-xl border border-emerald-200/10 bg-emerald-200/[0.04] p-5 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-200" />
                    <p className="mt-3 text-sm">You're on the list.</p>
                    <p className="mt-1 text-xs text-white/35">We'll use your interest to shape the next Tattava capabilities.</p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
