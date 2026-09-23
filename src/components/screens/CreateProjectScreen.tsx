import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Check, 
  ArrowRight, 
  Plus, 
  X, 
  Film, 
  Tv, 
  Video, 
  FileText, 
  Compass, 
  Info,
  Lock,
  Globe2
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const CreateProjectScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep, setActiveScreen } = useProject();

  const [title, setTitle] = useState(currentProject.title);
  const [contentType, setContentType] = useState(currentProject.contentType);
  const [language, setLanguage] = useState(currentProject.language);
  const [genre, setGenre] = useState(currentProject.genre);
  const [targetAudience, setTargetAudience] = useState(currentProject.intent.targetAudience);
  const [visibility, setVisibility] = useState(currentProject.visibility);
  const [tagline, setTagline] = useState(currentProject.tagline);
  const [tags, setTags] = useState<string[]>(currentProject.tags);
  const [newTagInput, setNewTagInput] = useState('');
  const [posterUrl, setPosterUrl] = useState(currentProject.posterUrl);

  const contentTypes = [
    { label: 'Feature Film', icon: <Film className="w-4 h-4" /> },
    { label: 'OTT Series', icon: <Tv className="w-4 h-4" /> },
    { label: 'Web Series', icon: <Video className="w-4 h-4" /> },
    { label: 'Documentary', icon: <Compass className="w-4 h-4" /> },
    { label: 'Short Film', icon: <Film className="w-4 h-4" /> },
    { label: 'TV Series', icon: <Tv className="w-4 h-4" /> },
    { label: 'Non-Fiction', icon: <FileText className="w-4 h-4" /> },
    { label: 'Other', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSaveAndContinue = () => {
    updateCurrentProject(prev => ({
      ...prev,
      title,
      contentType,
      language,
      genre,
      visibility,
      tagline,
      tags,
      posterUrl,
      intent: {
        ...prev.intent,
        contentType,
        language,
        targetAudience
      }
    }));
    nextStep();
  };

  const handleGeneratePosterAI = () => {
    const aiPosters = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=900&auto=format&fit=crop'
    ];
    const pick = aiPosters[(Math.random() * aiPosters.length) | 0];
    setPosterUrl(pick);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div>
        <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#f25b2a]">
          STEP 1 OF 16
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
          Create a New Project
        </h1>
        <p className="text-sm text-[#8b99ac] mt-1">
          Start a new project with key details. tattvaCo will set up your workspace and guide you from idea to a production-ready project.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Basic Information</span>
            </h2>

            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-1.5">
                Project Title <span className="text-[#f25b2a]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Last Monsoon"
                className="w-full bg-[#181d28] border border-[#2a3447] focus:border-[#f25b2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#68768a] focus:outline-none transition-all"
              />
            </div>

            {/* Content Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-2">
                Content Type <span className="text-[#f25b2a]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {contentTypes.map((item) => {
                  const isSelected = contentType === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setContentType(item.label)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#f25b2a]/15 border-[#f25b2a] text-[#f25b2a] shadow-glow-orange font-bold'
                          : 'bg-[#181d28] border-[#293244] text-[#8e9cb0] hover:text-white hover:bg-[#202736]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language & Genre row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#c8d4e4] mb-1.5">
                  Language(s) <span className="text-[#f25b2a]">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#2a3447] focus:border-[#f25b2a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c8d4e4] mb-1.5">
                  Genre (optional)
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Political Thriller"
                  className="w-full bg-[#181d28] border border-[#2a3447] focus:border-[#f25b2a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-1.5">
                Target Audience (optional)
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#181d28] border border-[#2a3447] focus:border-[#f25b2a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Adults (18+)">Adults (18+)</option>
                <option value="Young Adults (15-25)">Young Adults (15-25)</option>
                <option value="General Audience / Family">General Audience / Family</option>
                <option value="Prestige / Film Festival">Prestige / Film Festival</option>
              </select>
            </div>

            {/* Visibility Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-2">
                Project Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('Internal (Don Vanzara Team)')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs border text-left transition-all ${
                    visibility.includes('Internal')
                      ? 'bg-[#f25b2a]/15 border-[#f25b2a] text-white font-bold'
                      : 'bg-[#181d28] border-[#293244] text-[#8e9cb0]'
                  }`}
                >
                  <Globe2 className="w-4 h-4 text-[#f25b2a]" />
                  <span>Internal (Don Vanzara Team)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('Restricted')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs border text-left transition-all ${
                    visibility === 'Restricted'
                      ? 'bg-[#f25b2a]/15 border-[#f25b2a] text-white font-bold'
                      : 'bg-[#181d28] border-[#293244] text-[#8e9cb0]'
                  }`}
                >
                  <Lock className="w-4 h-4 text-[#8e9cb0]" />
                  <span>Restricted</span>
                </button>
              </div>
            </div>
          </div>

          {/* Project Poster & Tagline Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white">Project Poster & Identity</h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Poster Preview */}
              <div className="relative w-36 h-52 rounded-xl overflow-hidden border border-[#313c4e] shadow-lg flex-shrink-0 group">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white truncate">{title}</span>
                </div>
              </div>

              {/* Upload or Generate Actions */}
              <div className="flex-1 space-y-3 w-full">
                <div className="border border-dashed border-[#2f394c] rounded-xl p-4 text-center hover:border-[#f25b2a] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#8b98ac] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-white">Upload Poster Image</p>
                  <p className="text-[10px] text-[#6c7b8e]">JPG, PNG (Max 5MB)</p>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#232a39] w-full" />
                  <span className="bg-[#141822] px-3 text-[10px] text-[#6c7b8e] uppercase tracking-wider font-bold">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePosterAI}
                  className="w-full flex items-center justify-center gap-2 bg-[#1b212f] hover:bg-[#232b3d] text-amber-300 border border-amber-500/30 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate with AI</span>
                </button>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-1.5">
                Project Tagline (optional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Every rain reveals a truth."
                className="w-full bg-[#181d28] border border-[#2a3447] focus:border-[#f25b2a] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#68768a] focus:outline-none"
              />
            </div>

            {/* Keyword tags */}
            <div>
              <label className="block text-xs font-semibold text-[#c8d4e4] mb-2">
                Thematic Keywords
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1f2636] border border-[#2d374a] text-xs text-white"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#7e8d9f] hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="+ Add Keyword"
                    className="bg-[#181d28] border border-[#2a3447] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#68768a] focus:outline-none focus:border-[#f25b2a]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-1 rounded bg-[#202737] hover:bg-[#2b3548] text-white text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Copilot Guidance & Quote */}
        <div className="space-y-6">
          {/* tattvaCo Copilot Help Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#f25b2a]" />
              <h3 className="text-sm font-bold text-white">tattvaCo Copilot</h3>
            </div>
            <p className="text-xs text-[#a0aec0]">
              Creating a new project? I can help you:
            </p>
            <ul className="space-y-2 text-xs text-[#cad5e2]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refine your core idea</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suggest relevant genres and formats</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recommend reference films</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Set up the right template</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Identify key research areas</span>
              </li>
            </ul>

            {/* Pro tip */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#cad5e2]">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pro Tip</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#b1becf]">
                A clear project setup helps tattvaCo give you better, more relevant suggestions throughout your development journey.
              </p>
            </div>
          </div>

          {/* Inspirational Quote Card */}
          <div 
            className="rounded-2xl p-6 text-center border border-[#242c3d] bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop')` }}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
            <div className="relative z-10">
              <p className="font-script text-2xl text-amber-200 leading-snug">
                “A good story is a conversation with humanity.”
              </p>
              <p className="text-xs text-[#8e9eb2] mt-2 font-medium">— Don Vanzara</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#222836] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveScreen('home')}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#8b99ac] hover:text-white hover:bg-[#181d28] transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#718094]">Step 1 of 16</span>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-orange transition-all active:scale-95"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
