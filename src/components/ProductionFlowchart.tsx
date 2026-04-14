import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Database, BrainCircuit, ShieldCheck, Activity, Layers, BarChart, 
  Workflow, Radar, Settings, Search, Filter, Bell, LogOut, CircleCheck, 
  CircleAlert, Bot, DollarSign, Play, Pause, Square, ChevronRight, Check, 
  LayoutDashboard, Network, Mail, CreditCard, Eye, FileCode, Clock, Cpu,
  MapPin, Phone, Briefcase, Globe, Zap, Target, Share2, Maximize, Minimize,
  Plus, Minus, Map as MapIcon, Link, PenTool, Sparkles, Users
} from 'lucide-react';

// --- Sub-components for the Flowchart ---

const FlowLine = ({ d, color = '#cbd5e1', width = 1.5, animated = true, markerEnd }: { d: string, color?: string, width?: number, animated?: boolean, markerEnd?: string }) => (
  <g>
    <path 
      d={d} 
      stroke={color} 
      strokeWidth={width} 
      fill="none" 
      markerEnd={markerEnd}
      className="opacity-40"
    />
    {animated && (
      <path 
        d={d} 
        stroke={color} 
        strokeWidth={width} 
        fill="none" 
        strokeDasharray="10, 10"
        className="animate-[flow_20s_linear_infinite] opacity-80"
      />
    )}
  </g>
);

const SourceItem = ({ icon: Icon, label, stats, color = 'blue', isSpecial = false, onClick }: { icon: any, label: string, stats: string, color?: string, isSpecial?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer ${isSpecial ? 'bg-red-50/50 border-red-100' : 'bg-white'}`}
  >
    <div className={`p-3 rounded-2xl ${isSpecial ? 'bg-red-100 text-red-500' : `bg-${color}-50 text-${color}-500`} group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-bold truncate ${isSpecial ? 'text-slate-800' : 'text-slate-700'}`}>{label}</div>
      <div className="flex items-center gap-3 mt-1">
        {stats.split('  ').map((s, i) => (
          <span key={i} className={`text-[10px] font-medium ${isSpecial && s.includes('高优先') ? 'text-red-400' : 'text-slate-400'}`}>
            {s}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const AgentNode = ({ title, subtitle, stats, status, icon: Icon, color = 'red', isPipeline = false, onClick }: { title: string, subtitle?: string, stats?: any[], status?: string, icon: any, color?: string, isPipeline?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`w-56 bg-white rounded-3xl border-2 border-${color}-500 shadow-xl p-5 relative overflow-hidden group cursor-pointer hover:scale-105 transition-all`}
  >
    <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`} />
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-500`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div>
        <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
        {subtitle && (
          <div className={`text-[10px] font-bold bg-${color}-50 text-${color}-500 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider`}>
            {subtitle}
          </div>
        )}
      </div>

      {isPipeline ? (
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[11px] text-slate-400">总分发 (Total)</span>
            <span className="text-sm font-bold text-slate-800">5.2M</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-blue-600">已分发: 4.0M</span>
              <span className="text-slate-400">待分发: 1.2M</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '77%' }} />
            </div>
          </div>
        </div>
      ) : stats && (
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-medium">{s.label}</span>
                <span className="text-slate-800 font-bold">{s.value}</span>
              </div>
              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full bg-${s.color || color}-500 rounded-full`} style={{ width: s.percent }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {status && (
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{status}</span>
          </div>
          {!isPipeline && <div className="text-[10px] text-slate-400 font-medium">效率提升 77%</div>}
        </div>
      )}
    </div>
  </div>
);

const MapLineCard = ({ name, workValue, workPercent, qaValue, qaPercent, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm w-72 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
  >
    <div className="flex items-center gap-2 mb-4 border-l-4 border-red-500 pl-3">
      <div className="text-sm font-bold text-slate-800">{name}</div>
    </div>
    <div className="space-y-4">
      <div className="bg-slate-50/50 p-3 rounded-2xl">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500 font-bold">作业 Agent</span>
          <span className="text-slate-300 font-mono">{workValue}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: workPercent }} />
        </div>
        <div className="text-right text-[10px] font-bold text-red-500 mt-1">{workPercent}</div>
      </div>
      <div className="bg-slate-50/50 p-3 rounded-2xl">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500 font-bold">质检 Agent</span>
          <span className="text-slate-300 font-mono">{qaValue}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: qaPercent }} />
        </div>
        <div className="text-right text-[10px] font-bold text-emerald-500 mt-1">{qaPercent}</div>
      </div>
    </div>
  </div>
);

const AddressLineCard = ({ name, workValue, workPercent, qaValue, qaPercent, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm w-[400px] cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
  >
    <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-500 pl-3">
      <div className="text-sm font-bold text-slate-800">{name}</div>
    </div>
    <div className="flex gap-4">
      <div className="flex-1 bg-slate-50/50 p-3 rounded-2xl">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500 font-bold">作业 Agent</span>
        </div>
        <div className="text-[9px] text-slate-300 font-mono mb-1">{workValue}</div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: workPercent }} />
        </div>
        <div className="text-right text-[10px] font-bold text-blue-500 mt-1">{workPercent}</div>
      </div>
      <div className="flex-1 bg-slate-50/50 p-3 rounded-2xl">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500 font-bold">质检 Agent</span>
        </div>
        <div className="text-[9px] text-slate-300 font-mono mb-1">{qaValue}</div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: qaPercent }} />
        </div>
        <div className="text-right text-[10px] font-bold text-emerald-500 mt-1">{qaPercent}</div>
      </div>
    </div>
  </div>
);

const PortraitLineCard = ({ name, workValue, workPercent, qaValue, qaPercent, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-56 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
  >
    <div className="text-xs font-bold text-slate-800 mb-4">{name}</div>
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-slate-400">作业</span>
          <span className="text-slate-700 font-bold">{workValue}</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: workPercent }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-slate-400">质检</span>
          <span className="text-slate-700 font-bold">{qaValue}</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: qaPercent }} />
        </div>
      </div>
    </div>
  </div>
);

const ProductionSection = ({ title, icon: Icon, children, badge }: any) => (
  <div className="bg-slate-50/50 backdrop-blur-sm rounded-[3rem] border border-slate-200 p-8 flex flex-col gap-6">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-white shadow-sm text-slate-600 border border-slate-100">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-base font-bold text-slate-800">{title}</div>
      {badge && (
        <div className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {badge}
        </div>
      )}
    </div>
    <div className="flex gap-6 flex-wrap">
      {children}
    </div>
  </div>
);

export default function ProductionFlowchart({ 
  onNodeClick, 
  activeNode,
  isFullscreen = false,
  onToggleFullscreen,
  showGrid = true,
  enableFlow = true
}: { 
  onNodeClick: (node: string) => void, 
  activeNode: string | null,
  isFullscreen?: boolean,
  onToggleFullscreen?: () => void,
  showGrid?: boolean,
  enableFlow?: boolean
}) {
  const [scale, setScale] = useState(1);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.2), 3));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  };

  return (
    <div 
      onWheel={handleWheel}
      className={`relative w-full bg-[#f8fafc] overflow-hidden transition-all duration-500 ease-in-out ${
      isFullscreen 
        ? 'fixed inset-0 z-[100] h-screen w-screen rounded-none' 
        : 'h-full border-slate-200'
    } group/canvas cursor-grab active:cursor-grabbing`}>
      {/* Background Grid */}
      {showGrid && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      )}

      <motion.div 
        drag
        dragMomentum={false}
        animate={{ scale }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full h-full origin-center"
      >
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
            <marker id="arrowhead-slate" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
            <style>{`
              @keyframes flow {
                from { stroke-dashoffset: 1000; }
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </defs>
          
          {/* Source to Analysis */}
          <FlowLine d="M 320 200 C 360 200, 370 450, 416 450" animated={enableFlow} />
          <FlowLine d="M 320 280 C 360 280, 370 450, 416 450" animated={enableFlow} />
          <FlowLine d="M 320 360 C 360 360, 370 450, 416 450" animated={enableFlow} />
          <FlowLine d="M 320 440 C 360 440, 370 450, 416 450" animated={enableFlow} />
          <FlowLine d="M 320 520 C 360 520, 370 450, 416 450" animated={enableFlow} />
          <FlowLine d="M 320 600 C 360 600, 370 450, 416 450" animated={enableFlow} />

          {/* Analysis to Pipeline */}
          <FlowLine d="M 640 450 L 736 450" width={2} markerEnd="url(#arrowhead-slate)" animated={enableFlow} />

          {/* Pipeline to Production Lines */}
          <FlowLine d="M 960 450 C 1000 450, 1010 250, 1056 250" markerEnd="url(#arrowhead-slate)" animated={enableFlow} />
          <FlowLine d="M 960 450 C 1000 450, 1010 450, 1056 450" markerEnd="url(#arrowhead-slate)" animated={enableFlow} />
          <FlowLine d="M 960 450 C 1000 450, 1010 650, 1056 650" markerEnd="url(#arrowhead-slate)" animated={enableFlow} />

          {/* Production Lines to Scheduler */}
          <FlowLine d="M 2056 250 C 2100 250, 2110 500, 2152 500" animated={enableFlow} />
          <FlowLine d="M 2056 450 C 2100 450, 2110 500, 2152 500" animated={enableFlow} />
          <FlowLine d="M 2056 650 C 2100 650, 2110 500, 2152 500" animated={enableFlow} />

          {/* Scheduler to Storage */}
          <FlowLine d="M 2440 500 C 2480 500, 2490 440, 2536 440" color="#10b981" width={2} markerEnd="url(#arrowhead-slate)" animated={enableFlow} />
          <FlowLine d="M 2440 500 C 2480 500, 2490 560, 2536 560" color="#f59e0b" width={2} markerEnd="url(#arrowhead-slate)" animated={enableFlow} />
        </svg>

      {/* Flow Content */}
      <div className="absolute inset-0 flex items-center p-12 min-w-[2800px]">
        
        {/* Column 1: Sources */}
        <div className="w-80 flex flex-col gap-5 p-8 bg-slate-50/30 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Network className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">外部线索渠道</h3>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">External Clue Channels</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[11px] font-bold text-slate-600">总线索数: 5.2M</span>
              </div>
            </div>
          </div>
          
          <SourceItem icon={BrainCircuit} label="情报挖掘数字员工" stats="线索量: 1.2M  任务: 45K" color="blue" onClick={() => onNodeClick('情报挖掘数字员工')} />
          <SourceItem icon={Mail} label="物流回流" stats="线索量: 1.2M" color="indigo" onClick={() => onNodeClick('物流回流')} />
          <SourceItem icon={Database} label="丰行数据" stats="线索量: 1.2M" color="cyan" onClick={() => onNodeClick('丰行数据')} />
          <SourceItem icon={Layers} label="其他来源" stats="线索量: 0.4M" color="slate" onClick={() => onNodeClick('其他来源')} />
          <SourceItem icon={Zap} label="图面质检数字员工" stats="线索量: 1.2M  高优先级接入" isSpecial={true} onClick={() => onNodeClick('图面质检数字员工')} />
        </div>

        <div className="w-24" />

        {/* Column 2: Analysis Agent */}
        <AgentNode 
          title="资料分析 Agent" 
          subtitle="AI 整合中心"
          stats={[
            { label: '整合前 (Original)', value: '5.2M', percent: '90%', color: 'slate' },
            { label: '整合后 (Consolidated)', value: '1.2M', percent: '30%', color: 'red' }
          ]}
          status="STATUS: 运行中"
          icon={BarChart}
          onClick={() => onNodeClick('资料分析 Agent')}
        />

        <div className="w-24" />

        {/* Column 3: Pipeline Agent */}
        <AgentNode 
          title="产线任务分发 Agent" 
          subtitle="Task Dispatcher"
          isPipeline={true}
          status="运行中"
          icon={Network}
          color="blue"
          onClick={() => onNodeClick('产线任务分发 Agent')}
        />

        <div className="w-24" />

        {/* Column 4: Production Lines */}
        <div className="flex flex-col gap-8">
          <ProductionSection title="地图数据产线 (Map Lines)" icon={MapIcon} badge="核心数据">
            <MapLineCard name="POI 产线" workValue="120K Items" workPercent="95%" qaValue="102K Items" qaPercent="85%" onClick={() => onNodeClick('POI 产线')} />
            <MapLineCard name="道路 (Road)" workValue="45K Items" workPercent="98%" qaValue="38K Items" qaPercent="84%" onClick={() => onNodeClick('道路产线')} />
            <MapLineCard name="AOI/楼栋" workValue="220K Items" workPercent="75%" qaValue="140K Items" qaPercent="63%" onClick={() => onNodeClick('AOI/楼栋产线')} />
          </ProductionSection>

          <ProductionSection title="地址数据产线 (Address)" icon={MapPin}>
            <AddressLineCard name="标准地址" workValue="450K Items" workPercent="71%" qaValue="320K Items" qaPercent="68%" onClick={() => onNodeClick('标准地址产线')} />
            <AddressLineCard name="语义地址" workValue="120K Items" workPercent="95%" qaValue="115K Items" qaPercent="92%" onClick={() => onNodeClick('语义地址产线')} />
          </ProductionSection>

          <ProductionSection title="位置大数据画像 (Location Portrait)" icon={Database}>
            <PortraitLineCard name="企业画像" workValue="1.2M" workPercent="85%" qaValue="900K" qaPercent="75%" onClick={() => onNodeClick('企业画像产线')} />
            <PortraitLineCard name="网格画像" workValue="800K" workPercent="90%" qaValue="720K" qaPercent="80%" onClick={() => onNodeClick('网格画像产线')} />
            <PortraitLineCard name="电话画像" workValue="2.5M" workPercent="70%" qaValue="1.8M" qaPercent="60%" onClick={() => onNodeClick('电话画像产线')} />
            <PortraitLineCard name="热点经济画像" workValue="150K" workPercent="40%" qaValue="40K" qaPercent="20%" onClick={() => onNodeClick('热点经济画像产线')} />
          </ProductionSection>
        </div>

        <div className="w-24" />

        {/* Column 5: Scheduler Agent */}
        <div 
          onClick={() => onNodeClick('任务调度 Agent')}
          className="w-72 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-blue-200 p-6 relative cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-red-50 text-red-500">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">任务调度 Agent</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Manual Workload Overview</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm col-span-2">
              <div className="text-[11px] text-slate-400 mb-2">任务总量</div>
              <div className="text-2xl font-bold text-red-500">18K</div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-[11px] text-slate-400 mb-2">已入库总量</div>
              <div className="text-2xl font-bold text-slate-800">7K</div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-[11px] text-slate-400 mb-2">待人工总量</div>
              <div className="text-2xl font-bold text-red-500">135K</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-4">
            <span>合计总量 (TOTAL)</span>
            <span className="text-slate-800">240K</span>
          </div>
        </div>

        <div className="w-24" />

        {/* Column 6: Final Storage */}
        <div className="flex flex-col gap-8">
          <div 
            onClick={() => onNodeClick('核心产线入库统计')}
            className="w-96 bg-red-600 rounded-[2.5rem] shadow-2xl p-8 text-white cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-white/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold tracking-tight">核心产线入库统计</div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">地图数据产线</div>
                <div className="space-y-4">
                  {[
                    { name: 'POI', total: '120K', add: '+5.2K' },
                    { name: 'AOI', total: '220K', add: '+8.1K' },
                    { name: '道路 (Road)', total: '45K', add: '+1.5K' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-bold opacity-90">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] opacity-80">总量: {item.total}</span>
                        <span className="font-bold text-white">{item.add}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">地址数据产线</div>
                <div className="space-y-4">
                  {[
                    { name: '标准地址', total: '450K', add: '+10K' },
                    { name: '语义地址', total: '120K', add: '+2K' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-bold opacity-90">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] opacity-80">总量: {item.total}</span>
                        <span className="font-bold text-white">{item.add}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">位置大数据画像</div>
                <div className="space-y-4">
                  {[
                    { name: '企业画像', total: '1.2M', add: '+25K' },
                    { name: '网格/电话', total: '3.3M', add: '+42K' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-bold opacity-90">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] opacity-80">总量: {item.total}</span>
                        <span className="font-bold text-white">{item.add}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => onNodeClick('人工工作库统计')}
            className="w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-500">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold text-slate-800 tracking-tight">人工工作库统计</div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">地图数据产线</div>
                <div className="space-y-5">
                  {[
                    { name: 'POI', percent: '45%' },
                    { name: 'AOI', percent: '62%' },
                    { name: '道路 (Road)', percent: '28%' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">{item.name}</span>
                        <span className="text-slate-800 font-bold">{item.percent}</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: item.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">地址数据产线</div>
                <div className="space-y-5">
                  {[
                    { name: '标准地址', percent: '71%' },
                    { name: '语义地址', percent: '95%' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">{item.name}</span>
                        <span className="text-slate-800 font-bold">{item.percent}</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: item.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">位置大数据画像</div>
                <div className="space-y-5">
                  {[
                    { name: '企业画像', percent: '85%' },
                    { name: '网格/电话', percent: '15%' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">{item.name}</span>
                        <span className="text-slate-800 font-bold">{item.percent}</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: item.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-orange-600">总待处理量</span>
              <span className="text-lg font-bold text-slate-800">45K</span>
            </div>
          </div>
        </div>

        </div>
      </motion.div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 z-[110]">
        <button 
          onClick={onToggleFullscreen}
          className={`p-3 bg-white rounded-2xl border border-slate-200 shadow-lg transition-all hover:scale-110 active:scale-95 ${
            isFullscreen ? 'text-red-600 border-red-100' : 'text-slate-600'
          }`}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <button 
            onClick={() => handleZoom(0.1)}
            className="p-3 text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleZoom(-0.1)}
            className="p-3 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
