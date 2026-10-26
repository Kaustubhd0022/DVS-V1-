import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Layers, 
  Bot, 
  User, 
  CheckCircle2, 
  Lightbulb, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { planNextCreatorAction } from '../../services/nextActionPlanner';

export const ContextualCopilot: React.FC = () => {
  const { 
    isCopilotOpen, 
    setCopilotOpen, 
    activeScreen, 
    currentProject, 
    copilotMessages, 
    sendCopilotMessage,
    triggerChangeImpact,
    executeRegenerationPlan
  } = useProject();

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const nextAction = planNextCreatorAction(currentProject);

  if (!isCopilotOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;
    setInputVal('');
    setIsThinking(true);
    sendCopilotMessage(query);
    setTimeout(() => {
      setIsThinking(false);
    }, 600);
  };

  // Get domain-specific quick action chips based on the active screen
  const getContextChips = () => {
    switch (activeScreen) {
      case 'home':
        return [
          'Develop a new idea',
          'Research a concept',
          'Suggest story directions',
          'Analyze my script',
          'Help with production planning'
        ];
      case 'intake':
        return [
          'Is this a strong premise?',
          'What are some potential angles?',
          'Which genres could work best?',
          'What are similar reference films?'
        ];
      case 'research':
        return [
          'What research is still missing?',
          'Verify an unresolved project claim',
          'Connect findings to Scene 1',
          'Detect research contradictions'
        ];
      case 'story-exploration':
        return [
          'Combine Direction A & B',
          'Analyze commercial vs festival reach',
          'Deepen the central narrative engine',
          'Generate alternative Direction D'
        ];
      case 'characters':
        return [
          'Check character motivation consistency',
          'Analyze character change impact',
          'Generate a character voice profile',
          'Deepen the antagonist philosophy'
        ];
      case 'screenplay':
        return [
          'Rewrite Scene 1 with more tension',
          'Improve Aanya character voice',
          'Check dialogue rhythm',
          'Translate dialogue to English'
        ];
      case 'dialogue':
        return [
          'Suggest 3 emotional alternatives',
          'Add subtext to mother confrontation',
          'Detect cliches in Scene 1',
          'Check cultural authenticity'
        ];
      case 'qa':
        return [
          'Run visual continuity audit',
          'Fix Scene 1B prop mismatch with AI',
          'Check character look consistency',
          'Verify timeline chronology'
        ];
      case 'production':
        return [
          'Can we reduce location movement?',
          'Optimize 62-day shoot schedule',
          'Audit ₹12.5 Cr budget breakdown',
          'Review high severity weather risks'
        ];
      case 'package':
        return [
          'What is still awaiting approval?',
          'Summarize investor pitch narrative',
          'Check greenlight deliverable status',
          'Prepare distribution note'
        ];
      default:
        return [
          'Analyze current project stage',
          'Identify creative bottlenecks',
          'Check project memory consistency'
        ];
    }
  };

  const chips = getContextChips();

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-96 bg-[#1b1411]/95 border-l border-white/10 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200 backdrop-blur-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#1b1411]/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#33cc7a] flex items-center justify-center shadow-[0_2px_12px_rgba(51,204,122,0.35)]">
            <Sparkles className="w-4 h-4 text-[#1b1411]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>tattvaCo Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#33cc7a]/20 text-[#33cc7a] font-semibold border border-[#33cc7a]/30 font-mono">
                Beta
              </span>
            </h3>
            <p className="text-[11px] text-[#b8aba3]">
              {activeScreen === 'home' ? 'Global Film Intelligence' : `Context: ${currentProject.title}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#b8aba3] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Next Action Intelligence (Linea Bento Card) */}
      <div className="m-3 p-3.5 rounded-2xl bg-[#2e241f] border border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#b8aba3] font-mono">Tattva's Next Action</span>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] border border-[#33cc7a]/30">
            {nextAction.mode}
          </span>
        </div>
        <p className="text-xs text-[#faf5f0] font-medium">{nextAction.reason}</p>
        {nextAction.question && (
          <p className="text-[11px] text-[#eee5dc] mt-1.5">Question: {nextAction.question}</p>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          {nextAction.requiresHumanApproval && (
            <span className="text-[9px] text-[#33cc7a] font-medium">Human approval required</span>
          )}
          {nextAction.mode === 'REGENERATE' && nextAction.sourcePlanId && (
            <button
              onClick={async () => {
                setIsThinking(true);
                await executeRegenerationPlan(nextAction.sourcePlanId!);
                setIsThinking(false);
              }}
              className="ml-auto linea-pill-btn bg-[#33cc7a] text-[#1b1411] hover:bg-[#2bb86c] font-semibold px-3 py-1 text-[10px]"
            >
              Regenerate
            </button>
          )}
          {nextAction.mode === 'ASK' && nextAction.question && (
            <button
              onClick={() => handleSend(nextAction.question)}
              className="ml-auto linea-pill-btn bg-white/10 text-white hover:bg-white/20 px-3 py-1 text-[10px]"
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Project Context Badge */}
      <div className="px-4 py-2 bg-[#15100e]/80 border-y border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#b8aba3]">
          <Layers className="w-3.5 h-3.5 text-[#33cc7a]" />
          <span className="truncate text-[11px]">Reading Canonical Project Memory</span>
        </div>
        <span className="text-[10px] font-bold text-[#33cc7a] flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#33cc7a] animate-pulse shadow-[0_0_6px_rgba(51,204,122,0.8)]" />
          Live
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {copilotMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2.5 text-xs ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {(msg.sender === 'tattvaCo' || msg.sender === 'tattava') && (
              <div className="w-6 h-6 rounded-full bg-[#33cc7a]/20 border border-[#33cc7a]/40 flex items-center justify-center flex-shrink-0 text-[#33cc7a] mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#33cc7a] text-[#1b1411] font-semibold shadow-[0_2px_12px_rgba(51,204,122,0.25)]'
                  : 'bg-[#2e241f] text-[#faf5f0] border border-white/10 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-[#1b1411]/70' : 'text-[#b8aba3]'
                }`}
              >
                {msg.time}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5 text-xs items-center text-[#b8aba3]">
            <div className="w-6 h-6 rounded-full bg-[#33cc7a]/20 border border-[#33cc7a]/40 flex items-center justify-center text-[#33cc7a]">
              <RefreshCw className="w-3 h-3 animate-spin" />
            </div>
            <span className="italic text-[11px] flex items-center gap-1.5">
              <span>tattvaCo is synthesizing project memory</span>
              <span className="linea-btn-wave" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Context Prompt Chips */}
      <div className="p-3 border-t border-white/[0.08] bg-[#1b1411]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#b8aba3] mb-2">
          <Lightbulb className="w-3 h-3 text-[#33cc7a]" />
          <span>Recommended for this screen:</span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="w-full text-left text-xs text-[#eee5dc] hover:text-white bg-[#2e241f] hover:bg-[#3a2f29] border border-white/[0.08] hover:border-[#33cc7a]/40 px-3 py-1.5 rounded-full flex items-center justify-between group transition-all"
            >
              <span className="truncate">{chip}</span>
              <ChevronRight className="w-3 h-3 text-[#b8aba3] group-hover:text-[#33cc7a] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-white/[0.08] bg-[#15100e]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask tattvaCo about your project..."
            className="w-full bg-[#2e241f] border border-white/10 rounded-full pl-4 pr-11 py-2.5 text-xs text-[#faf5f0] placeholder-[#b8aba3] focus:outline-none focus:border-[#33cc7a] focus:ring-1 focus:ring-[#33cc7a]/40 transition-all"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="absolute right-1.5 w-7 h-7 rounded-full bg-[#33cc7a] hover:bg-[#2bb86c] text-[#1b1411] flex items-center justify-center disabled:opacity-30 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
