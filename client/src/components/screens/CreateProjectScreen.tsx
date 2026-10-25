import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  ArrowRight, 
  Film, 
  Tv, 
  Video, 
  FileText, 
  Compass, 
  Info,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

export const CreateProjectScreen: React.FC = () => {
  const { createNewProject, setActiveScreen, openDemoProject, sendDiscoveryMessage } = useProject();

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Feature Film');
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('');
  const [contentMode, setContentMode] = useState('Infotainment');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [language, setLanguage] = useState('Hindi / English');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contentTypes = [
    { label: 'Movie', icon: <Film className="w-3.5 h-3.5" /> },
    { label: 'Feature Film', icon: <Film className="w-3.5 h-3.5" /> },
    { label: 'Series / OTT', icon: <Tv className="w-3.5 h-3.5" /> },
    { label: 'Mini-Series', icon: <Video className="w-3.5 h-3.5" /> },
    { label: 'Short Film', icon: <Film className="w-3.5 h-3.5" /> },
    { label: 'Documentary', icon: <Compass className="w-3.5 h-3.5" /> },
    { label: 'Podcast', icon: <FileText className="w-3.5 h-3.5" /> },
    { label: 'Exploration', icon: <Compass className="w-3.5 h-3.5" /> },
    { label: 'Informant', icon: <Info className="w-3.5 h-3.5" /> },
    { label: 'Other', icon: <Sparkles className="w-3.5 h-3.5" /> }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        content: text || `[Uploaded Document: ${file.name}]`
      });

      if (!premise.trim() && text) {
        const preview = text.replace(/\s+/g, ' ').trim().slice(0, 160);
        if (preview) setPremise(preview);
      }
    };

    reader.readAsText(file);
  };

  const handleCreateProject = () => {
    if (!title.trim() && !premise.trim() && !uploadedFile) {
      setErrorMsg('Please provide at least a project title, a rough story premise, or upload a document.');
      return;
    }

    const effectiveTitle = title.trim() || (premise ? premise.slice(0, 32).trim() + '...' : 'Untitled Project');
    const effectivePremise = premise.trim() || (uploadedFile ? `Uploaded document: ${uploadedFile.name}` : `Project concept: ${effectiveTitle}`);

    createNewProject({
      title: effectiveTitle,
      contentType,
      genre,
      language,
      intent: {
        premise: premise.trim(),
        rawConcept: premise.trim(),
        uploadedMaterialName: uploadedFile?.name,
        uploadedMaterialContent: uploadedFile?.content,
        protagonist: '',
        setting: '',
        conflict: '',
        stakes: '',
        themes: [],
        tone: '',
        contentType,
        language,
        targetAudience: 'Theatrical & Premium OTT',
        status: 'DRAFT',
        missingQuestions: [],
        ambiguitiesIdentified: [],
        intakeAnalysisStatus: 'IDLE',
        storyBrainProposed: false
      }
    });

    setTimeout(() => {
      sendDiscoveryMessage(effectivePremise, uploadedFile || undefined);
    }, 60);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fadeIn">
      {/* Top Banner */}
      <BentoCard className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <LineaCaption variant="amber" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Create Project
            </LineaCaption>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
              Input-Driven Initialization
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#fbf8f3]">
            Start a New Story Project
          </h1>
          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
            Tattava builds narrative intelligence strictly from your premise and source material. No pre-seeded characters or canon are assumed.
          </p>
        </div>

        <div className="relative z-10 self-start md:self-auto">
          <LineaButton
            variant="ghost"
            size="sm"
            onClick={openDemoProject}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          >
            Explore Sample Demo Project
          </LineaButton>
        </div>
      </BentoCard>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <BentoCard className="p-6 lg:p-8 space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
            Project Name / Working Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="e.g. Echoes of the Deep, The Last Monsoon, Vidarbha Bloodline..."
            className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-5 py-3 text-xs sm:text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none transition-all"
          />
        </div>

        {/* Content Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
            Project Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {contentTypes.map((item) => {
              const isSelected = contentType === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setContentType(item.label)}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-[#0a0c12]/80 hover:bg-[#141720] border-white/[0.08] text-stone-300 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Initial Idea / Premise (Core Input) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Initial Idea / Premise <span className="text-amber-400">*</span>
            </label>
            <span className="text-[11px] text-stone-500">Only a rough concept is needed to start</span>
          </div>
          <textarea
            rows={4}
            value={premise}
            onChange={(e) => {
              setPremise(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="e.g. My story is about a 28-year-old marine biologist who discovers that an isolated coastal village is hiding a dangerous secret about the collapse of their local coral reef..."
            className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-2xl p-4 text-xs sm:text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none transition-all leading-relaxed resize-none"
          />
        </div>

        {/* Upload Existing Material */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
            Upload Existing Material (Optional)
          </label>
          <div className="relative border border-dashed border-white/[0.15] hover:border-amber-500/50 rounded-3xl p-6 text-center transition-all bg-[#0a0c12]/60">
            <input
              type="file"
              accept=".txt,.pdf,.docx,.doc,.json,.md"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3 text-emerald-400 font-semibold text-xs">
                <FileCheck className="w-5 h-5" />
                <span>Uploaded: <strong>{uploadedFile.name}</strong> ({uploadedFile.size})</span>
                <span className="text-stone-500 text-[11px]">• Click to replace</span>
              </div>
            ) : (
              <div className="space-y-1.5 pointer-events-none">
                <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-[#fbf8f3]">
                  Drop your concept brief, screenplay treatment, or pitch notes here
                </p>
                <p className="text-[11px] text-stone-500">
                  Supports PDF, DOCX, TXT, Markdown, or JSON
                </p>
              </div>
            )}
          </div>
        </div>

        {/* V1 Content Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Content Mode
            </label>
            <select
              value={contentMode}
              onChange={(e) => setContentMode(e.target.value)}
              className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-4 py-2.5 text-xs text-[#fbf8f3] focus:outline-none"
            >
              {['Informational','Educational','Documentary','Infotainment','Narrative','Exploratory','Hybrid'].map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <p className="text-[10px] text-stone-500">Format and mode are separate so hybrid projects are first-class.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Primary Knowledge Domain
            </label>
            <input
              type="text"
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="e.g. History, Food, Mythology, Culture & Traditions"
              className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-4 py-2.5 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none"
            />
            <p className="text-[10px] text-stone-500">Tattava can expand this into connected domains during Discovery.</p>
          </div>
        </div>

        {/* Optional Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Primary Genre (Optional)
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Psychological Thriller, Mystery, Sci-Fi..."
              className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-4 py-2.5 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Primary Language (Optional)
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. Hindi, English, Bilingual..."
              className="w-full bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-4 py-2.5 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveScreen('home')}
            className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <LineaButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleCreateProject}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Launch Creative Discovery Studio
          </LineaButton>
        </div>
      </BentoCard>
    </div>
  );
};
