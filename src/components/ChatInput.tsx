import React, { useState } from 'react';
import { Paperclip, BrainCircuit, AtSign, Scissors, Mic, ChevronDown, ArrowUp, Cpu } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLarge?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLarge = false, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-2xl p-3 flex flex-col transition-all focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-300 ${isLarge ? 'w-full max-w-4xl' : 'w-full'}`}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="输入您的问题或需求，例如：帮我找一个适合开咖啡店的地方..."
        className={`w-full resize-none outline-none text-slate-800 placeholder:text-slate-400 bg-transparent ${isLarge ? 'min-h-[120px] text-base' : 'min-h-[60px] text-sm'}`}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-slate-400">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><BrainCircuit className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><AtSign className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><Scissors className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><Mic className="w-4 h-4" /></button>
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
          <button className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <Cpu className="w-3.5 h-3.5" />
            sonnet-4.5
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-colors ml-1"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
