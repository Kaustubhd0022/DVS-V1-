import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Check, 
  ArrowRight, 
  Film, 
  Tv, 
  Video, 
  FileText, 
  Compass, 
  Info,
  Layers,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const CreateProjectScreen: React.FC = () => {
  const { createNewProject, setActiveScreen, openDemoProject, sendDiscoveryMessage } = useProject();

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Feature Film');
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('Thriller / Drama');
  const [language, setLanguage] = useState('Hindi / English');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contentTypes = [
    { label: 'Feature Film', icon: <Film className="w-4 h-4" /> },
    { label: 'Series / OTT', icon: <Tv className="w-4 h-4" /> },
    { label: 'Mini-Series', icon: <Video className="w-4 h-4" /> },
    { label: 'Short Film', icon: <Film className="w-4 h-4" /> },
    { label: 'Documentary', icon: <Compass className="w-4 h-4" /> },
    { label: 'Other', icon: <Sparkles className="w-4 h-4" /> }
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

      // If premise is empty, extract first 200 chars as tentative premise
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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              CREATE PROJECT
            </span>
            <span className="text-xs text-white/40">• Input-Driven Project Initialization</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">
            Start a New Story Project
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Tattava builds narrative intelligence strictly from your premise and source material. No pre-seeded characters or canon are assumed.
          </p>
        </div>

        <button
          onClick={openDemoProject}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Explore Sample Demo Project</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
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
            className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
          />
        </div>

        {/* Content Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
            Project Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {contentTypes.map((item) => {
              const isSelected = contentType === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setContentType(item.label)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-black/30 hover:bg-black/60 border-white/10 text-white/70 hover:text-white'
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
              Initial Idea / Premise <span className="text-amber-400">*</span>
            </label>
            <span className="text-[11px] text-white/40">Only a rough concept is needed to start</span>
          </div>
          <textarea
            rows={4}
            value={premise}
            onChange={(e) => {
              setPremise(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="e.g. My story is about a 28-year-old marine biologist who discovers that an isolated coastal village is hiding a dangerous secret about the collapse of their local coral reef..."
            className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none transition-all leading-relaxed"
          />
        </div>

        {/* Upload Existing Material */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
            Upload Existing Material (Optional)
          </label>
          <div className="relative border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-all bg-black/20">
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
                <span className="text-white/40 text-[11px]">• Click to replace</span>
              </div>
            ) : (
              <div className="space-y-1.5 pointer-events-none">
                <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-white">
                  Drop your concept brief, screenplay treatment, or pitch notes here
                </p>
                <p className="text-[11px] text-white/40">
                  Supports PDF, DOCX, TXT, Markdown, or JSON
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optional Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
              Primary Genre (Optional)
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Psychological Thriller, Mystery, Sci-Fi..."
              className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
              Primary Language (Optional)
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. Hindi, English, Bilingual..."
              className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveScreen('home')}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            <span>Launch Creative Discovery Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
