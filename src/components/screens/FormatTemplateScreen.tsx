import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Film, Tv, Smartphone, Sparkles, CheckCircle2, 
  ArrowRight, Sliders, ShieldCheck, ChevronRight, BarChart3, AlertCircle, FileText
} from 'lucide-react';
import { FormatOption, TemplateOption } from '../../types/project';

export const FormatTemplateScreen: React.FC = () => {
  const { currentProject, setProjectFormat, setProjectTemplate, nextStep } = useProject();

  const [formats, setFormats] = useState<FormatOption[]>([
    {
      id: 'format-feature',
      title: 'Feature Film',
      duration: '110 – 140 Mins',
      description: 'Tight three-act cinematic structure built for maximum emotional catharsis, theatrical impact, and premium OTT release.',
      isRecommended: true,
      isSelected: currentProject.format === 'Feature Film',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'
    },
    {
      id: 'format-limited',
      title: 'Limited Series',
      duration: '6 – 8 Episodes (45 min each)',
      description: 'Deep-dive serialized investigation exploring multiple perspectives across Delhi political corridors and regional investigative units.',
      isRecommended: false,
      isSelected: currentProject.format === 'Limited Series',
      imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80'
    },
    {
      id: 'format-episodic',
      title: 'Episodic Procedural',
      duration: '10 – 12 Episodes',
      description: 'Case-of-the-week framework with an overarching conspiracy arc anchored by Aanya Verma’s ongoing investigative department.',
      isRecommended: false,
      isSelected: currentProject.format === 'Episodic Procedural',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80'
    },
    {
      id: 'format-vertical',
      title: 'Vertical Mini-Series',
      duration: '20 – 30 Micro-Episodes (2 min)',
      description: 'Mobile-first snackable thriller with high-frequency cliffhangers targeted at Gen-Z social streaming platforms.',
      isRecommended: false,
      isSelected: currentProject.format === 'Vertical Mini-Series',
      imageUrl: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&q=80'
    }
  ]);

  const [templates, setTemplates] = useState<TemplateOption[]>([
    {
      id: 'tmpl-3act',
      title: 'Three-Act Classical Thriller',
      description: 'Inciting incident at Min 12, Midpoint reversal at Min 60, All is Lost at Min 85, Climax at Min 105. Optimized for Indian cinematic pacing.',
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
      description: 'Dual timeline intertwining Aanya’s present interrogation with the fateful 48 hours before the meteorological dam breach.',
      tags: ['Non-Linear', 'Mystery', 'Auteur Driven'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&q=80'
    }
  ]);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showRationale, setShowRationale] = useState(true);

  const handleSelectFormat = (id: string, title: string) => {
    setFormats(prev => prev.map(f => ({ ...f, isSelected: f.id === id })));
    setProjectFormat(title);
  };

  const handleSelectTemplate = (id: string, title: string) => {
    setTemplates(prev => prev.map(t => ({ ...t, isSelected: t.id === id })));
    setProjectTemplate(title);
  };

  const reevaluateWithAI = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
    }, 900);
  };

  const selectedFormatObj = formats.find(f => f.isSelected) || formats[0];
  const selectedTmplObj = templates.find(t => t.isSelected) || templates[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1500px] mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 05
            </span>
            <span className="text-xs text-white/40">• Narrative Architecture Framework</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Format & Structural Template
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            tattvaCo evaluates thematic density, pacing cadence, and market distribution targets to recommend the optimal story chassis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reevaluateWithAI}
            disabled={aiAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiAnalyzing ? 'animate-spin' : ''}`} />
            <span>{aiAnalyzing ? 'Re-analyzing Scope...' : 'Re-run AI Synthesis'}</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Confirm & Next: Character Dev</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Recommendation Spotlight Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/60 border border-amber-500/30 relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Recommendation Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  94.2% Structural Fit
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Recommended Format: <span className="text-amber-400">Feature Film (120 Mins)</span> with Three-Act Classical Arc
              </h2>
              <p className="text-xs text-white/70 mt-1 max-w-3xl leading-relaxed">
                Based on Aanya Verma’s singular moral dilemma, a 48-hour ticking clock monsoon scenario, and target theatrical release, a 125-minute feature film provides tighter stakes and higher ROI than an elongated series.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRationale(!showRationale)}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-xs font-medium border border-white/10 shrink-0 transition-colors"
          >
            {showRationale ? 'Hide Deep Rationale' : 'View Deep Rationale'}
          </button>
        </div>

        {showRationale && (
          <div className="mt-6 pt-5 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Story Complexity</div>
              <div className="text-sm font-semibold text-white mt-1">High Focus / Linear Intensity</div>
              <div className="text-xs text-white/60 mt-1">Single protagonist journey prevents narrative dilution.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Audience Appetite</div>
              <div className="text-sm font-semibold text-white mt-1">Theatrical + Global SVOD</div>
              <div className="text-xs text-white/60 mt-1">High demand for grounded realistic Indian thrillers.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Runtime & Cadence</div>
              <div className="text-sm font-semibold text-white mt-1">115 – 125 Minutes</div>
              <div className="text-xs text-white/60 mt-1">Perfect fit for 32 tightly orchestrated sequence scenes.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Production Feasibility</div>
              <div className="text-sm font-semibold text-white mt-1">₹35 – 45 Cr Envelope</div>
              <div className="text-xs text-white/60 mt-1">45 shoot days across Mumbai & Western Ghats rain rigs.</div>
            </div>
          </div>
        )}
      </div>

      {/* Format Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              1. Choose Project Format
            </h3>
            <p className="text-xs text-white/50">Select the distribution medium and narrative duration for this title.</p>
          </div>
          <span className="text-xs text-white/40 font-mono">Current: <span className="text-amber-400 font-semibold">{currentProject.format}</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {formats.map(fmt => (
            <div
              key={fmt.id}
              onClick={() => handleSelectFormat(fmt.id, fmt.title)}
              className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col justify-between ${
                fmt.isSelected
                  ? 'bg-gradient-to-b from-amber-950/40 to-black/80 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-[#12141a]/80 hover:bg-[#161822] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={fmt.imageUrl}
                  alt={fmt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {fmt.isRecommended && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Match
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-amber-300/90 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                    {fmt.duration}
                  </span>
                  {fmt.isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className={`text-base font-bold transition-colors ${fmt.isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {fmt.title}
                  </h4>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {fmt.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-medium">
                  <span className={fmt.isSelected ? 'text-amber-400 font-semibold' : 'text-white/40'}>
                    {fmt.isSelected ? 'Active Selection' : 'Click to Select'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${fmt.isSelected ? 'text-amber-400 translate-x-0.5' : 'text-white/20'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structural Template Grid */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              2. Select Structural Rhythm / Template
            </h3>
            <p className="text-xs text-white/50">Defines the default beat sheet, sequence breakdown, and tension pacing models.</p>
          </div>
          <span className="text-xs text-white/40 font-mono">Current: <span className="text-amber-400 font-semibold">{currentProject.template}</span></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id, tmpl.title)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                tmpl.isSelected
                  ? 'bg-gradient-to-b from-amber-950/40 to-black/80 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-[#12141a]/80 hover:bg-[#161822] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-base font-bold ${tmpl.isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {tmpl.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tmpl.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  tmpl.isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20 text-transparent'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-white/70 mt-3 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">Default Breakdown:</span>
                <span className="font-mono text-white/80">3 Acts • 8 Sequences • 32 Beats</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Confirmation Bar */}
      <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-white/50">Active Configuration Locked</div>
            <div className="text-sm font-semibold text-white">
              {currentProject.format} • {currentProject.template} (Status: APPROVED)
            </div>
          </div>
        </div>

        <button
          onClick={nextStep}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <span>Confirm & Proceed to Characters</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
