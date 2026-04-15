import React from 'react';
import { Plus, BrainCircuit, Bot, Timer, Network, MessageSquare, MoreHorizontal, PanelLeftClose, Radar, Settings, Key, Layers, BookOpen } from 'lucide-react';

const GeoOpsLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Spatial Hexagon (Space) */}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Central Core (Time & Intelligence) - Enlarged for clarity */}
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    
    {/* Clock Hands (Time) - Enlarged */}
    <path d="M12 8.5V12L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Decision Paths (Routing & AI) - Simplified to bold spokes */}
    <path d="M12 2.5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 16.5L7.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16.5L16.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ activeView, setActiveView, onNewChat }: SidebarProps) {
  return (
    <div className="w-[260px] h-full bg-[#fcfcfc] border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-left">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-1.5 rounded-xl shadow-sm border border-red-400/20">
            <GeoOpsLogo className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            AI-<span className="text-red-500">GeoOps</span>
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 mt-4 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">全局管理</h3>
        </div>
        <div className="px-3 space-y-1 mb-4">
          <NavItem 
            icon={<Radar className="w-4 h-4" />} 
            label="产线管理看板" 
            isActive={activeView === 'mission-control'}
            onClick={() => setActiveView('mission-control')}
          />
        </div>

        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">资料分析层</h3>
        </div>
        <div className="px-3 space-y-1 mb-4">
          <NavItem 
            icon={<Network className="w-4 h-4" />} 
            label="资料分析中心" 
            isActive={activeView === 'data-analysis'}
            onClick={() => setActiveView('data-analysis')}
          />
        </div>

        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">核心调度层</h3>
        </div>
        <div className="px-3 space-y-1 mb-4">
          <NavItem 
            icon={<Timer className="w-4 h-4" />} 
            label="任务调度监控" 
            badge="1" 
            isActive={activeView === 'cron-tasks'}
            onClick={() => setActiveView('cron-tasks')}
          />
        </div>

        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">产线Agent层</h3>
        </div>
        <div className="px-3 space-y-1 mb-4">
          <NavItem 
            icon={<Layers className="w-4 h-4" />} 
            label="产线SOP管理" 
            isActive={activeView === 'sop-management'}
            onClick={() => setActiveView('sop-management')}
          />
          <NavItem 
            icon={<BookOpen className="w-4 h-4" />} 
            label="产线Wiki管理" 
            isActive={activeView === 'wiki-management'}
            onClick={() => setActiveView('wiki-management')}
          />
          <NavItem 
            icon={<Bot className="w-4 h-4" />} 
            label="产线Agent管理" 
            isActive={activeView === 'claw-store'}
            onClick={() => setActiveView('claw-store')}
          />
          <NavItem 
            icon={<BrainCircuit className="w-4 h-4" />} 
            label="产线Skills管理" 
            isActive={activeView === 'skill-store'}
            onClick={() => setActiveView('skill-store')}
          />
        </div>

        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">系统配置</h3>
        </div>
        <div className="px-3 space-y-1 mb-6">
          <NavItem 
            icon={<Key className="w-4 h-4" />} 
            label="Token&API管理" 
            isActive={activeView === 'token-api'}
            onClick={() => setActiveView('token-api')}
          />
          <NavItem 
            icon={<Settings className="w-4 h-4" />} 
            label="系统管理" 
            isActive={activeView === 'system-settings'}
            onClick={() => setActiveView('system-settings')}
          />
          <NavItem 
            icon={<BookOpen className="w-4 h-4" />} 
            label="PRD管理" 
            isActive={activeView === 'prd-management'}
            onClick={() => setActiveView('prd-management')}
          />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, badge, isActive, onClick }: { icon: React.ReactNode, label: string, badge?: string, isActive?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${isActive ? 'bg-red-50 text-red-600' : 'hover:bg-slate-100 text-slate-700'}`}
    >
      <div className="flex items-center gap-3">
        <span className={`${isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-700'}`}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
