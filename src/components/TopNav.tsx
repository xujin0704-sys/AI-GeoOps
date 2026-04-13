import React from 'react';
import { Zap, Coins, ExternalLink, Minus, Square, X, Menu, Smartphone } from 'lucide-react';

export default function TopNav() {
  return (
    <div className="h-14 flex items-center justify-between px-4 shrink-0 w-full bg-white z-10">
      <div></div> {/* Spacer for left side */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
          <Zap className="w-4 h-4" />
          升级 Plus
        </button>
        
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop" 
          alt="User" 
          className="w-8 h-8 rounded-full object-cover border border-slate-200"
        />
        
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700">
          <Coins className="w-4 h-4 text-slate-400" />
          2000
        </div>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
        
        <button className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors">
          中国版
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </button>
        
        <div className="flex items-center gap-2 ml-2 text-slate-400">
          <button className="p-1 hover:bg-slate-100 rounded"><Menu className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 rounded"><Minus className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 rounded"><Square className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
