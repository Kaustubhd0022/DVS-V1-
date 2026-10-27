import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Film, Sparkles, CheckCircle2, 
  ArrowRight, Sliders, ShieldCheck, ChevronRight
} from 'lucide-react';
import { FormatOption, TemplateOption } from '../../types/project';
import { askCopilot } from '../../services/aiService';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const FormatTemplateScreen: React.FC = () => {
  const { currentProject, setProjectFormat, setProjectTemplate, nextStep } = useProject();

  const isCurrentSeries = /series/i.test(currentProject.format || '');
  const parsedCount = currentProject.format?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1]
    || currentProject.title?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1];
  const initialCount = currentProject.dynamicFormat?.episodeCount 
    || (parsedCount ? parseInt(parsedCount, 10) : undefined)
    || (isCurrentSeries ? 10 : 10);

  const [customEpisodeCount, setCustomEpisodeCount] = useState<number>(initialCount);

  const [formats, setFormats] = useState<FormatOption[]>([
    {
      id: 'format-feature',
      title: 'Feature Film',
      duration: '110 – 140 Mins',
      description: 'Tight three-act cinematic structure built for maximum emotional catharsis, theatrical impact, and premium OTT release.',
      isRecommended: !isCurrentSeries,
      isSelected: currentProject.format === 'Feature Film',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'
    },
    {
      id: 'format-series-custom',
      title: `${initialCount}-Episode Serialized Epic`,
      duration: `${initialCount} Episodes (45 – 60 min)`,
      description: `Prestige multi-arc historical or geopolitical series architecture. Designed for ${initialCount} sequential episodes with deep institutional conflicts, multi-faction allegiances, and complete character transformations.`,
      isRecommended: isCurrentSeries,
      isSelected: isCurrentSeries,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'
    },
    {
      id: 'format-limited',
      title: 'Limited Series',
      duration: '6 – 8 Episodes (45 min each)',
      description: 'Deep-dive serialized investigation exploring multiple perspectives and institutional layers across episodic arcs.',
      isRecommended: false,
      isSelected: currentProject.format === 'Limited Series' && customEpisodeCount <= 8,
      imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80'
    },
    {
      id: 'format-episodic',
      title: 'Episodic Procedural',
      duration: '10 – 12 Episodes',
      description: 'Case-of-the-week framework with an overarching conspiracy arc anchored by the ensemble cast.',
      isRecommended: false,
      isSelected: currentProject.format === 'Episodic Procedural',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80'
    },
    {
      id: 'format-vertical',
      title: 'Vertical Mini-Series',
      duration: '20 – 30 Micro-Episodes (2 min)',
      description: 'Mobile-first snackable thriller with high-frequency cliffhangers targeted at digital-native streaming platforms.',
      isRecommended: false,
      isSelected: currentProject.format === 'Vertical Mini-Series',
      imageUrl: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&q=80'
    }
  ]);

  const [templates, setTemplates] = useState<TemplateOption[]>([
    {
      id: 'tmpl-3act',
      title: 'Three-Act Classical Thriller',
      description: 'Inciting incident in Act I, Midpoint reversal in Act II, All is Lost and Climax in Act III. Optimized for maximum dramatic tension.',
      tags: ['Syd Field', 'Hero’s Journey', 'Commercial Pacing'],
      isSelected: true,
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80'
    },
    {
      id: 'tmpl-cat',
      title: 'Blake Snyder 15-Beat Board',
      description: 'Rigorous structural beats ensuring tight cause-and-effect transitions, debate sequences, and high-tension ticking clocks.',
      tags: ['Save the Cat', 'Hollywood Standard', 'High Tension'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80'
    },
    {
      id: 'tmpl-nonlinear',
      title: 'Rashomon Non-Linear Mesh',
      description: 'Multi-timeline architecture intertwining present-day revelations with past pivotal events that led to the crisis.',
      tags: ['Non-Linear', 'Mystery', 'Auteur Driven'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&q=80'
    }
  ]);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showRationale, setShowRationale] = useState(true);
  const [aiRationaleText, setAiRationaleText] = useState(
    `Based on the current project configuration, Tattava will structure the story using the selected format and template rather than a fixed feature-film assumption.`
  );

  const handleSelectFormat = (id: string, title: string, epCount?: number) => {
    const matchCount = title.match(/(\d+)\s*(?:episod|ep)/i)?.[1];
    const effectiveCount = epCount || (matchCount ? parseInt(matchCount, 10) : title.includes('Limited') ? 8 : title.includes('Episodic') ? 12 : undefined);
    if (effectiveCount) setCustomEpisodeCount(effectiveCount);
    setFormats(prev => prev.map(f => ({ ...f, isSelected: f.id === id })));
    setProjectFormat(title, effectiveCount);
  };

  const handleUpdateEpisodeCount = (count: number) => {
    const safeCount = Math.max(3, Math.min(32, count));
    setCustomEpisodeCount(safeCount);
    const title = safeCount === 16 ? '16-Episode Serialized Epic' : `${safeCount}-Episode Series`;
    setProjectFormat(title, safeCount);
  };

  const handleSelectTemplate = (id: string, title: string) => {
    setTemplates(prev => prev.map(t => ({ ...t, isSelected: t.id === id })));
    setProjectTemplate(title);
  };

  const reevaluateWithAI = async () => {
    setAiAnalyzing(true);
    try {
      const prompt = `Give a crisp 2-sentence executive rationale recommending the optimal narrative format (Feature vs Series) and pacing for: "${currentProject.title}" (Premise: ${currentProject.intent?.premise || currentProject.tagline}). Keep it sharp and commercial.`;
      const reply = await askCopilot(prompt, `Project: ${currentProject.title}`);
      if (reply) {
        setAiRationaleText(reply);
      }
    } catch (e) {
      console.warn('Reevaluate AI error', e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1500px] mx-auto pb-16">
      {/* Top Banner / Header */}
      <BentoCard className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <LineaCaption variant="amber" icon={<Sliders className="w-3.5 h-3.5" />}>
              Pipeline Step 05 • Architecture
            </LineaCaption>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
              Chassis & Rhythm Framework
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Format & Structural Template
          </h1>
          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
            tattvaCo evaluates thematic density, pacing cadence, and market distribution targets to recommend the optimal story chassis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <LineaButton
            variant="ghost"
            size="md"
            showWave={aiAnalyzing}
            onClick={reevaluateWithAI}
            disabled={aiAnalyzing}
            icon={<Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiAnalyzing ? 'animate-spin' : ''}`} />}
          >
            {aiAnalyzing ? 'Re-analyzing Scope...' : 'Re-run AI Synthesis'}
          </LineaButton>

          <LineaButton
            variant="primary"
            size="md"
            onClick={nextStep}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Confirm & Next: Character Dev
          </LineaButton>
        </div>
      </BentoCard>

      {/* AI Recommendation Spotlight Card */}
      <BentoCard className="p-6 lg:p-8 border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Recommendation Engine</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  94.2% Structural Fit
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#fbf8f3] mt-1">
                Current Configuration: <span className="text-amber-300">{currentProject.format} • {currentProject.format?.toLowerCase().includes('series') ? '45 min / episode' : 'feature runtime'} • {currentProject.template || 'Three-Act Classical Thriller'}</span>
              </h2>
              <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
                {aiRationaleText}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRationale(!showRationale)}
            className="px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-semibold border border-white/[0.1] shrink-0 transition-colors cursor-pointer"
          >
            {showRationale ? 'Hide Deep Rationale' : 'View Deep Rationale'}
          </button>
        </div>

        {showRationale && (
          <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#0a0c12]/70 border border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Story Complexity</div>
              <div className="text-xs font-bold text-[#fbf8f3] mt-1">High Focus / Linear Intensity</div>
              <div className="text-xs text-stone-400 mt-1">Single protagonist journey prevents narrative dilution.</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0a0c12]/70 border border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Audience Appetite</div>
              <div className="text-xs font-bold text-[#fbf8f3] mt-1">Theatrical + Global SVOD</div>
              <div className="text-xs text-stone-400 mt-1">High demand for grounded realistic Indian thrillers.</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0a0c12]/70 border border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Runtime & Cadence</div>
              <div className="text-xs font-bold text-[#fbf8f3] mt-1">{currentProject.format?.toLowerCase().includes('series') ? '45 min / episode' : '110 – 140 Minutes'}</div>
              <div className="text-xs text-stone-400 mt-1">Perfect fit for 32 tightly orchestrated sequence scenes.</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0a0c12]/70 border border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Production Feasibility</div>
              <div className="text-xs font-bold text-[#fbf8f3] mt-1">₹35 – 45 Cr Envelope</div>
              <div className="text-xs text-stone-400 mt-1">45 shoot days across Mumbai & Western Ghats rain rigs.</div>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Format Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#fbf8f3] flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              1. Choose Project Format
            </h3>
            <p className="text-xs text-stone-400">Select the distribution medium and narrative duration for this title.</p>
          </div>
          <span className="text-xs text-stone-500 font-mono">Current: <span className="text-amber-300 font-semibold">{currentProject.format}</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {formats.map(fmt => (
            <BentoCard
              key={fmt.id}
              onClick={() => handleSelectFormat(fmt.id, fmt.title)}
              className={`group cursor-pointer overflow-hidden transition-all duration-300 p-0 flex flex-col justify-between ${
                fmt.isSelected
                  ? 'border-amber-500/60 shadow-xl shadow-black/60 ring-1 ring-amber-500/30'
                  : 'hover:border-white/[0.16]'
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={fmt.imageUrl}
                  alt={fmt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1119] via-[#0e1119]/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {fmt.isRecommended && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 shadow-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Match
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-amber-300 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08]">
                    {fmt.duration}
                  </span>
                  {fmt.isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className={`text-sm sm:text-base font-bold transition-colors ${fmt.isSelected ? 'text-amber-300' : 'text-[#fbf8f3]'}`}>
                    {fmt.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                    {fmt.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium">
                  <span className={fmt.isSelected ? 'text-amber-300 font-semibold' : 'text-stone-500'}>
                    {fmt.isSelected ? 'Active Selection' : 'Click to Select'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${fmt.isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'}`} />
                </div>
              </div>
            </BentoCard>
          ))}
        </div>

        {/* Dynamic Episode Architecture Configurator */}
        {(isCurrentSeries || formats.some(f => f.isSelected && /series/i.test(f.title))) && (
          <BentoCard className="p-6 border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Dynamic Series Architecture Engine
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#fbf8f3] mt-1.5">Configure Target Season Scope & Episode Count</h4>
                <p className="text-xs text-stone-400">
                  Set the number of episodes for serialized story structure, character arc distribution, and historical pacing.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#0a0c12]/80 px-4 py-2 rounded-2xl border border-white/[0.08]">
                <span className="text-xs text-stone-400">Total Episodes:</span>
                <span className="text-lg font-mono font-bold text-amber-300">{customEpisodeCount}</span>
                <span className="text-xs text-stone-500">× 45-60m</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-stone-500 uppercase font-mono tracking-wider">Presets:</span>
              {[6, 8, 10, 12, 16, 20].map(epCount => (
                <button
                  key={epCount}
                  type="button"
                  onClick={() => handleUpdateEpisodeCount(epCount)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    customEpisodeCount === epCount
                      ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white border-white/[0.08]'
                  }`}
                >
                  {epCount === 16 ? '⭐ 16 Ep (Flagship Epic)' : `${epCount} Episodes`}
                </button>
              ))}
            </div>

            {/* Live Quadrant Act Distribution Preview */}
            {(() => {
              const q1 = Math.max(1, Math.round(customEpisodeCount * 0.25));
              const q2 = Math.max(q1 + 1, Math.round(customEpisodeCount * 0.5));
              const q3 = Math.max(q2 + 1, Math.round(customEpisodeCount * 0.75));

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Act I: The Spark</span>
                    <p className="text-xs font-semibold text-white">Episodes 1 – {q1}</p>
                    <p className="text-[10px] text-stone-400">Inciting incident & regional world established</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Act II-A: Escalation</span>
                    <p className="text-xs font-semibold text-white">Episodes {q1 + 1} – {q2}</p>
                    <p className="text-[10px] text-stone-400">Patronage alliances form & conflicts rise</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Act II-B: Crisis</span>
                    <p className="text-xs font-semibold text-white">Episodes {q2 + 1} – {q3}</p>
                    <p className="text-[10px] text-stone-400">Siege, ideological dispute & breaking point</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Act III: Climax</span>
                    <p className="text-xs font-semibold text-white">Episodes {q3 + 1} – {customEpisodeCount}</p>
                    <p className="text-[10px] text-stone-400">Sacred monument consecrated & final resolution</p>
                  </div>
                </div>
              );
            })()}
          </BentoCard>
        )}
      </div>

      {/* Structural Template Grid */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#fbf8f3] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              2. Select Structural Rhythm / Template
            </h3>
            <p className="text-xs text-stone-400">Defines the default beat sheet, sequence breakdown, and tension pacing models.</p>
          </div>
          <span className="text-xs text-stone-500 font-mono">Current: <span className="text-amber-300 font-semibold">{currentProject.template}</span></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {templates.map(tmpl => (
            <BentoCard
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id, tmpl.title)}
              className={`p-5 sm:p-6 cursor-pointer transition-all duration-300 relative ${
                tmpl.isSelected
                  ? 'border-amber-500/60 shadow-xl shadow-black/60 ring-1 ring-amber-500/30'
                  : 'hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-base font-bold ${tmpl.isSelected ? 'text-amber-300' : 'text-[#fbf8f3]'}`}>
                    {tmpl.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tmpl.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  tmpl.isSelected ? 'bg-amber-400 border-amber-300 text-stone-950 font-bold' : 'border-white/20 text-transparent'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-stone-300 mt-3 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-stone-500">Default Breakdown:</span>
                <span className="font-mono text-stone-300">3 Acts • 8 Sequences • 32 Beats</span>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Bottom Confirmation Bar */}
      <BentoCard className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400">Active Configuration Locked</div>
            <div className="text-xs sm:text-sm font-semibold text-[#fbf8f3]">
              {currentProject.format} • {currentProject.template} (Status: APPROVED)
            </div>
          </div>
        </div>

        <LineaButton
          variant="primary"
          size="md"
          onClick={nextStep}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Confirm & Proceed to Characters
        </LineaButton>
      </BentoCard>
    </div>
  );
};
