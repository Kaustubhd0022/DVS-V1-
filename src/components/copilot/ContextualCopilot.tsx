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

export const ContextualCopilot: React.FC = () => {
  const { 
    isCopilotOpen, 
    setCopilotOpen, 
    activeScreen, 
    currentProject, 
    copilotMessages, 
    sendCopilotMessage,
    triggerChangeImpact
  } = useProject();

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

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
          'Verify coaching hub claims',
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
          'Does Aanya motivation stay consistent?',
          'Test Change Impact: Age 24 → 34',
          'Generate voice profile for Kabir',
          'Deepen antagonist philosophy'
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
    <aside className="fixed right-0 top-0 bottom-0 w-96 bg-[#10131a] border-l border-[#242b3a] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#222836] flex items-center justify-between bg-[#121620]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f25b2a] to-amber-500 flex items-center justify-center shadow-glow-orange">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>tattvaCo Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Beta
              </span>
            </h3>
            <p className="text-[11px] text-[#7d8b9f]">
              {activeScreen === 'home' ? 'Global Film Intelligence' : `Context: ${currentProject.title}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="p-1.5 rounded-lg text-[#7d8b9f] hover:text-white hover:bg-[#1f2533] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Project Context Badge */}
      <div className="px-4 py-2 bg-[#141822] border-b border-[#1f2533] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#9aa6b8]">
          <Layers className="w-3.5 h-3.5 text-[#f25b2a]" />
          <span className="truncate">Reading Canonical Project Memory</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
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
              <div className="w-6 h-6 rounded-full bg-[#f25b2a]/20 border border-[#f25b2a]/40 flex items-center justify-center flex-shrink-0 text-[#f25b2a] mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#f25b2a] text-white rounded-br-none shadow-sm'
                  : 'bg-[#181c26] text-[#cad4e2] border border-[#272e3d] rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-[#6c788c]'
                }`}
              >
                {msg.time}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#272e3d] flex items-center justify-center flex-shrink-0 text-[#8b96a8] mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5 text-xs items-center text-[#8b96a8]">
            <div className="w-6 h-6 rounded-full bg-[#f25b2a]/20 border border-[#f25b2a]/40 flex items-center justify-center text-[#f25b2a]">
              <RefreshCw className="w-3 h-3 animate-spin" />
            </div>
            <span className="italic text-[11px]">tattvaCo is analyzing project memory...</span>
          </div>
        )}
      </div>

      {/* Dynamic Context Prompt Chips */}
      <div className="p-3 border-t border-[#1f2533] bg-[#121620]/90">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8b96a8] mb-2">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Recommended for this screen:</span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (chip.includes('Age 24 → 34')) {
                  triggerChangeImpact('char-aanya', 'age', 24, 34);
                } else {
                  handleSend(chip);
                }
              }}
              className="w-full text-left text-xs text-[#b5c1d1] hover:text-white bg-[#171b24] hover:bg-[#202636] border border-[#282f3f] hover:border-[#384359] px-2.5 py-1.5 rounded-lg flex items-center justify-between group transition-all"
            >
              <span className="truncate">{chip}</span>
              <ChevronRight className="w-3 h-3 text-[#647287] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#222836] bg-[#0d0f14]">
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
            className="w-full bg-[#171a22] border border-[#2a3242] rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-[#687588] focus:outline-none focus:border-[#f25b2a] transition-all"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-[#f25b2a] hover:bg-[#e04b1a] text-white disabled:opacity-30 disabled:hover:bg-[#f25b2a] transition-all"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </aside>
  );
};
