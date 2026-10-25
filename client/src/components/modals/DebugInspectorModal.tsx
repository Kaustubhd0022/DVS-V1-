import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  X, 
  Terminal, 
  Brain, 
  Cpu, 
  Copy, 
  Check, 
  Key
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { getLastAiDebugTrace, getAiStatus, testAiConnection } from '../../services/aiService';
import { BentoCard, LineaCaption, LineaButton, LineaEqualizerWave } from '../common/LineaUI';

interface DebugInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugInspectorModal: React.FC<DebugInspectorModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, activeScreen } = useProject();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-trace' | 'story-brain' | 'context'>('overview');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const debugTrace = getLastAiDebugTrace();
  const [aiConfigured, setAiConfigured] = useState(false);
  const hasKey = aiConfigured;

  useEffect(() => {
    if (!isOpen) return;
    getAiStatus().then(s => setAiConfigured(s.configured)).catch(() => setAiConfigured(false));
  }, [isOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testAiConnection();
    setTestResult(res.message);
    setIsTesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <BentoCard className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs p-0 bg-[#0e1119]/95 border-sky-500/30">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-black/40 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#fbf8f3] flex items-center gap-2">
                  Pilot Development & Context Inspector
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-medium">
                  Live Trace
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                Verify that AI receives real project context and returns validated structured candidates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.1] text-[11px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>{isTesting ? 'Testing AI...' : 'Test AI Connection'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-[#0a0c12]/60 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="text-stone-500">Project:</span>
              <strong className="text-amber-300">{currentProject.id}</strong>
            </span>
            <span className="text-stone-700">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-stone-500">Sample?</span>
              <strong className={currentProject.isDemo ? 'text-amber-300' : 'text-emerald-400'}>
                {currentProject.isDemo ? 'YES' : 'NO (User)'}
              </strong>
            </span>
            <span className="text-stone-700">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-stone-500">Version:</span>
              <strong className="text-sky-300">{currentProject.canonicalVersion || 'v0.1'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 font-semibold ${hasKey ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Key className="w-3 h-3" />
              <span>{hasKey ? 'AI Backend Ready' : 'AI Offline'}</span>
            </span>
            <span className="text-stone-500">Screen: {activeScreen}</span>
          </div>
        </div>

        {testResult && (
          <div className="px-5 py-2.5 bg-sky-950/30 border-b border-sky-500/20 text-sky-300 text-xs flex items-center justify-between">
            <span>{testResult}</span>
            <button onClick={() => setTestResult(null)} className="text-stone-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Tabs Capsule */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-white/[0.08] bg-[#0a0c12]/40 overflow-x-auto">
          {[
            { id: 'overview', label: 'Project State' },
            { id: 'ai-trace', label: 'Last AI Request / Response' },
            { id: 'story-brain', label: `Story Brain (${currentProject.storyBrain?.canonFacts?.length || 0} Facts)` },
            { id: 'context', label: 'Current Context Slice' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Tab 1: Project State Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-stone-500 block text-[10px] font-semibold">TITLE</span>
                  <span className="font-bold text-[#fbf8f3] text-xs mt-1 block truncate">{currentProject.title}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-stone-500 block text-[10px] font-semibold">CHARACTERS</span>
                  <span className="font-bold text-[#fbf8f3] text-xs mt-1 block">{currentProject.characters.length} Registered</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-stone-500 block text-[10px] font-semibold">CANON FACTS</span>
                  <span className="font-bold text-sky-300 text-xs mt-1 block">{currentProject.storyBrain?.canonFacts?.length || 0} Locked</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-stone-500 block text-[10px] font-semibold">CONTINUITY</span>
                  <span className="font-bold text-amber-400 text-xs mt-1 block">{currentProject.continuityIssues?.length || 0} Flags</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-stone-500 block text-[10px] font-semibold uppercase tracking-wider">PREMISE STORED IN STATE:</span>
                <p className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] text-stone-300 leading-relaxed font-sans text-xs">
                  {currentProject.intent?.premise || 'No premise set yet.'}
                </p>
              </div>

              {currentProject.characters.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-stone-500 block text-[10px] font-semibold uppercase tracking-wider">ESTABLISHED CHARACTERS:</span>
                  <div className="space-y-1.5">
                    {currentProject.characters.map(c => (
                      <div key={c.id} className="p-3 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#fbf8f3]">{c.name} ({c.role}, Age {c.age})</span>
                        <span className="text-stone-400">Flaw: {c.flaw}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Last AI Trace */}
          {activeTab === 'ai-trace' && (
            <div className="space-y-4">
              {debugTrace ? (
                <>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                    <div>
                      <span className="text-stone-500 block text-[10px] font-semibold">TASK & MODEL</span>
                      <span className="font-bold text-sky-300">{debugTrace.task} • {debugTrace.model}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-500 block text-[10px] font-semibold">LATENCY</span>
                      <span className="font-bold text-emerald-400">{debugTrace.latencyMs} ms ({debugTrace.timestamp})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase tracking-wider">PROJECT CONTEXT SENT TO MODEL:</span>
                      <button
                        onClick={() => handleCopy(debugTrace.contextSent)}
                        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Context'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] text-stone-300 max-h-40 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                      {debugTrace.contextSent}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase tracking-wider">RAW AI RESPONSE OUTPUT:</span>
                      <button
                        onClick={() => handleCopy(debugTrace.rawResponse)}
                        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Output</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-black/60 border border-sky-500/20 text-sky-200 max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                      {debugTrace.rawResponse}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-stone-500 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-stone-600" />
                  <p>No AI inference requests recorded in this session yet.</p>
                  <p className="text-[11px]">Perform an AI action (e.g. Analyze Intake, Generate Characters, Punch-Up Dialogue) to see the live trace.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Story Brain State */}
          {activeTab === 'story-brain' && (
            <div className="space-y-3">
              {currentProject.storyBrain?.canonFacts?.length > 0 ? (
                currentProject.storyBrain.canonFacts.map((fact, idx) => (
                  <div key={fact.id} className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-[10px]">#CF-0{idx + 1} • {fact.category}</span>
                      <span className="text-stone-500 text-[10px]">{fact.dateEstablished}</span>
                    </div>
                    <p className="text-[#fbf8f3] text-xs font-sans">{fact.statement}</p>
                    <span className="text-stone-400 text-[10px] block">Source: {fact.source}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-500">
                  <Brain className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p>Story Brain is currently empty.</p>
                  <p className="text-[11px]">Run Project Intake and click "Approve Understanding as Canon" to lock the initial facts.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Current Context Slice */}
          {activeTab === 'context' && (
            <div className="space-y-3">
              <span className="text-stone-500 text-[10px] font-semibold block uppercase tracking-wider">
                ACTIVE SCOPED CONTEXT CACHE ({currentProject.activeContextPackage?.taskType || 'None'}):
              </span>
              <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] text-stone-300 max-h-72 overflow-y-auto whitespace-pre-wrap text-[11px]">
                {JSON.stringify(currentProject.activeContextPackage || { status: 'No active context slice assembled' }, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </BentoCard>
    </div>
  );
};
