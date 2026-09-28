import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  X, 
  Terminal, 
  Brain, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Eye, 
  RefreshCw,
  Key
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { getLastAiDebugTrace, getGroqApiKey, testGroqConnection } from '../../services/aiService';

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
  const apiKey = getGroqApiKey();
  const hasKey = !!apiKey;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testGroqConnection();
    setTestResult(res.message);
    setIsTesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f1219] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 bg-[#141824] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pilot Development & Context Inspector</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-normal">
                  Live Trace
                </span>
              </h2>
              <p className="text-[11px] text-white/40 font-sans">
                Verify that AI receives real project context and returns validated structured candidates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-[10px] flex items-center gap-1.5 transition-all"
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>{isTesting ? 'Testing LPU...' : 'Test Groq LPU'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-white/40">Project ID:</span>
              <strong className="text-amber-400">{currentProject.id}</strong>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-white/40">Is Demo?</span>
              <strong className={currentProject.isDemo ? 'text-amber-400' : 'text-emerald-400'}>
                {currentProject.isDemo ? 'YES (Sample Data)' : 'NO (User Project)'}
              </strong>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-white/40">Version:</span>
              <strong className="text-cyan-400">{currentProject.canonicalVersion || 'v0.1'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 font-bold ${hasKey ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Key className="w-3 h-3" />
              <span>{hasKey ? 'Groq Key Active' : 'Key Missing'}</span>
            </span>
            <span className="text-white/40">Screen: {activeScreen}</span>
          </div>
        </div>

        {testResult && (
          <div className="px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/20 text-cyan-300 text-[11px] flex items-center justify-between">
            <span>{testResult}</span>
            <button onClick={() => setTestResult(null)} className="text-white/40 hover:text-white">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-white/10 bg-[#12151e]">
          {[
            { id: 'overview', label: 'Project State' },
            { id: 'ai-trace', label: 'Last AI Request / Response' },
            { id: 'story-brain', label: `Story Brain (${currentProject.storyBrain?.canonFacts?.length || 0} Facts)` },
            { id: 'context', label: 'Current Context Slice' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 border-b-2 text-xs transition-colors ${
                activeTab === t.id
                  ? 'border-cyan-400 text-cyan-300 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Tab 1: Project State Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block text-[10px]">TITLE</span>
                  <span className="font-bold text-white text-xs mt-0.5 block truncate">{currentProject.title}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block text-[10px]">CHARACTERS</span>
                  <span className="font-bold text-white text-xs mt-0.5 block">{currentProject.characters.length} Registered</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block text-[10px]">CANON FACTS</span>
                  <span className="font-bold text-cyan-400 text-xs mt-0.5 block">{currentProject.storyBrain?.canonFacts?.length || 0} Locked</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block text-[10px]">CONTINUITY ISSUES</span>
                  <span className="font-bold text-amber-400 text-xs mt-0.5 block">{currentProject.continuityIssues?.length || 0} Flags</span>
                </div>
              </div>

              <div>
                <span className="text-white/40 block text-[10px] mb-1">PREMISE STORED IN STATE:</span>
                <p className="p-3 rounded-xl bg-black/50 border border-white/5 text-white/80 leading-relaxed font-sans text-xs">
                  {currentProject.intent?.premise || 'No premise set yet.'}
                </p>
              </div>

              {currentProject.characters.length > 0 && (
                <div>
                  <span className="text-white/40 block text-[10px] mb-1">ESTABLISHED CHARACTERS:</span>
                  <div className="space-y-1">
                    {currentProject.characters.map(c => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{c.name} ({c.role}, Age {c.age})</span>
                        <span className="text-white/40">Flaw: {c.flaw}</span>
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
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div>
                      <span className="text-white/40 block text-[10px]">TASK & MODEL</span>
                      <span className="font-bold text-cyan-300">{debugTrace.task} • {debugTrace.model}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/40 block text-[10px]">LATENCY</span>
                      <span className="font-bold text-emerald-400">{debugTrace.latencyMs} ms ({debugTrace.timestamp})</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-[10px]">PROJECT CONTEXT SENT TO MODEL:</span>
                      <button
                        onClick={() => handleCopy(debugTrace.contextSent)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Context'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-white/70 max-h-40 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                      {debugTrace.contextSent}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-[10px]">RAW AI RESPONSE OUTPUT:</span>
                      <button
                        onClick={() => handleCopy(debugTrace.rawResponse)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Output</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/60 border border-cyan-500/20 text-cyan-200 max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                      {debugTrace.rawResponse}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-white/40 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-white/20" />
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
                  <div key={fact.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-[10px]">#CF-0{idx + 1} • {fact.category}</span>
                      <span className="text-white/30 text-[10px]">{fact.dateEstablished}</span>
                    </div>
                    <p className="text-white/90 text-xs font-sans">{fact.statement}</p>
                    <span className="text-white/40 text-[10px] block">Source: {fact.source}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-white/40">
                  <Brain className="w-8 h-8 mx-auto text-white/20 mb-2" />
                  <p>Story Brain is currently empty.</p>
                  <p className="text-[11px]">Run Project Intake and click "Approve Understanding as Canon" to lock the initial facts.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Current Context Slice */}
          {activeTab === 'context' && (
            <div className="space-y-3">
              <span className="text-white/40 text-[10px] block">
                ACTIVE SCOPED CONTEXT CACHE ({currentProject.activeContextPackage?.taskType || 'None'}):
              </span>
              <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-white/70 max-h-72 overflow-y-auto whitespace-pre-wrap text-[11px]">
                {JSON.stringify(currentProject.activeContextPackage || { status: 'No active context slice assembled' }, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
