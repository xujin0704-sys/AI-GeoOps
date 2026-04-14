import React, { useState } from 'react';
import { 
  Activity, Users, Workflow, ShieldAlert, SquareTerminal, 
  Search, Filter, Bell, LogOut, CircleCheck, CircleAlert, 
  Bot, DollarSign, Play, Pause, Square, ChevronRight, Check, LayoutDashboard, Radar, Network,
  Database, Mail, CreditCard, Eye, Settings, FileCode, Clock, ShieldCheck, Cpu, Layers, Share2, Maximize, MapPin, Plus,
  BarChart, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { useDictionary } from '../contexts/DictionaryContext';
import ProductionFlowchart from './ProductionFlowchart';
import { AnimatePresence } from 'motion/react';

// --- Detail Panel Component ---

const NodeDetailPanel = ({ node, onClose, onOpenConsole }: { node: string, onClose: () => void, onOpenConsole: () => void }) => {
  // Mock details based on node name
  const getDetails = (name: string) => {
    if (name.includes('Agent')) {
      return {
        type: 'AI Agent',
        status: 'Active',
        uptime: '14d 2h',
        efficiency: '94.2%',
        description: `${name} 负责处理流水线中的核心逻辑，通过多模态大模型实现数据的高度自动化处理。`,
        metrics: [
          { label: 'Token 消耗', value: '1.2M / day' },
          { label: '平均响应', value: '0.8s' },
          { label: '成功率', value: '99.9%' }
        ]
      };
    }
    if (name.includes('产线')) {
      return {
        type: 'Production Line',
        status: 'Running',
        uptime: '45d 8h',
        efficiency: '88.5%',
        description: `${name} 是核心业务产线，支持从原始数据接入到最终入库的全流程监控与质量把控。`,
        metrics: [
          { label: '日处理量', value: '450K' },
          { label: '人工介入率', value: '12.4%' },
          { label: '质检合格率', value: '98.2%' }
        ]
      };
    }
    return {
      type: 'Data Source / Storage',
      status: 'Connected',
      uptime: '120d',
      efficiency: '100%',
      description: `${name} 节点提供稳定的数据支撑，确保全链路数据的实时性与准确性。`,
      metrics: [
        { label: '数据吞吐', value: '5.2M / hr' },
        { label: '延迟', value: '24ms' },
        { label: '可用性', value: '99.99%' }
      ]
    };
  };

  const details = getDetails(node);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col"
    >
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{node}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{details.status}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
        >
          <Plus className="w-5 h-5 rotate-45" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-2xl">
              <div className="text-[10px] text-slate-400 mb-1">类型</div>
              <div className="text-xs font-bold text-slate-700">{details.type}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl">
              <div className="text-[10px] text-slate-400 mb-1">运行时间</div>
              <div className="text-xs font-bold text-slate-700">{details.uptime}</div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">节点描述</h3>
          <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/30 p-4 rounded-2xl border border-blue-50/50">
            {details.description}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">实时指标</h3>
          <div className="space-y-3">
            {details.metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500">{m.label}</span>
                <span className="text-sm font-bold text-slate-800">{m.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">运行趋势</h3>
          <div className="h-32 w-full bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
            <BarChart className="w-8 h-8 text-slate-200" />
            <span className="text-[10px] text-slate-300 ml-2 font-medium">趋势图表加载中...</span>
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-50 bg-slate-50/30">
        <button 
          onClick={onOpenConsole}
          className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
        >
          进入节点控制台
        </button>
      </div>
    </motion.div>
  );
};

// --- Console Component ---

const NodeConsole = ({ node, onClose }: { node: string, onClose: () => void }) => {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Initializing connection to ${node}...`,
    `[${new Date().toLocaleTimeString()}] Authenticating with secure token...`,
    `[${new Date().toLocaleTimeString()}] Connection established.`,
    `[${new Date().toLocaleTimeString()}] Fetching real-time telemetry...`,
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${node} - Processing batch ${Math.floor(Math.random() * 10000)} - Status: OK`;
      setLogs(prev => [...prev.slice(-15), newLog]);
    }, 2000);
    return () => clearInterval(interval);
  }, [node]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl h-[600px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SquareTerminal className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-mono text-slate-300">{node} 控制台</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <div className="flex-1 p-6 font-mono text-xs text-emerald-500 overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-slate-600 shrink-0">{i + 1}</span>
              <span>{log}</span>
            </div>
          ))}
          <div className="flex gap-4 animate-pulse">
            <span className="text-slate-600 shrink-0">{logs.length + 1}</span>
            <span className="w-2 h-4 bg-emerald-500" />
          </div>
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-4">
          <span className="text-emerald-500 font-mono text-xs">$</span>
          <input 
            type="text" 
            placeholder="输入指令..." 
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-300 font-mono placeholder:text-slate-700"
          />
        </div>
      </div>
    </motion.div>
  );
};

// --- Mock Data based on Harness Architecture ---

const MOCK_MISSIONS = [
  {
    mission_id: "hr_9921",
    production_line: "POI产线",
    agent: "资料分析Agent",
    intent: "批量处理POI数据清洗",
    status: "Needs_Intervention",
    risk_level: "High",
    takeover_reason: "触发数据质量护栏：单次清洗异常率超过 15%",
    harness_state: {
      context: { status: 'success', detail: '已加载 12k 条数据上下文 (4.2k tokens)' },
      orchestration: { status: 'success', detail: '调用 clean_api, db_update' },
      validation: { status: 'failed', detail: '异常率超限，拦截自动执行' },
      state: { status: 'paused', detail: '事务已挂起，等待授权' },
      observability: { status: 'logging', detail: '已记录高风险操作审计日志' },
      takeover: { status: 'pending', detail: '等待数据质检员确认' }
    },
    cost: "¥ 0.42",
    latency: "1.2s"
  },
  {
    mission_id: "hr_9922",
    production_line: "AOI/楼栋产线",
    agent: "图像识别Agent",
    intent: "提取卫星图新增建筑轮廓",
    status: "Needs_Intervention",
    risk_level: "Medium",
    takeover_reason: "触发置信度护栏：部分轮廓识别置信度低于 80%",
    harness_state: {
      context: { status: 'success', detail: '已提取目标区域卫星图切片' },
      orchestration: { status: 'success', detail: '生成轮廓矢量数据，准备调用 save_api' },
      validation: { status: 'warning', detail: '包含低置信度轮廓，需人工复核' },
      state: { status: 'paused', detail: '保存队列已挂起' },
      observability: { status: 'logging', detail: '矢量草稿已归档' },
      takeover: { status: 'pending', detail: '等待标注员确认' }
    },
    cost: "¥ 0.15",
    latency: "0.8s"
  },
  {
    mission_id: "hr_9923",
    production_line: "道路产线",
    agent: "拓扑分析Agent",
    intent: "清理过期路网测试数据",
    status: "Needs_Intervention",
    risk_level: "Critical",
    takeover_reason: "触发数据安全护栏：检测到 DROP/DELETE 核心表操作",
    harness_state: {
      context: { status: 'success', detail: '已扫描 150 张表，定位 3 张测试表' },
      orchestration: { status: 'success', detail: '生成 SQL 清理脚本' },
      validation: { status: 'failed', detail: 'SQL 包含 DROP TABLE 生产库指令' },
      state: { status: 'paused', detail: '数据库连接已断开' },
      observability: { status: 'logging', detail: '已触发 DBA 告警' },
      takeover: { status: 'pending', detail: '等待 DBA 授权' }
    },
    cost: "¥ 0.85",
    latency: "2.4s"
  },
  {
    mission_id: "hr_9924",
    production_line: "位置画像产线",
    agent: "日常巡检Agent",
    intent: "生成每日产线运行报告",
    status: "Running",
    risk_level: "Low",
    takeover_reason: null,
    harness_state: {
      context: { status: 'success', detail: '已汇总 24h 运行日志 (128k tokens)' },
      orchestration: { status: 'running', detail: '正在调用 data_analysis_tool' },
      validation: { status: 'pending', detail: '-' },
      state: { status: 'active', detail: '流式生成中...' },
      observability: { status: 'logging', detail: 'Token 消耗持续记录中' },
      takeover: { status: 'skipped', detail: '无需接管' }
    },
    cost: "¥ 1.20",
    latency: "4.5s"
  },
  {
    mission_id: "hr_9925",
    production_line: "地址产线",
    agent: "地址解析Agent",
    intent: "批量解析新增物流订单地址",
    status: "Success",
    risk_level: "Low",
    takeover_reason: null,
    harness_state: {
      context: { status: 'success', detail: '1000条地址已加载' },
      orchestration: { status: 'success', detail: '并发调用 geocode_api' },
      validation: { status: 'success', detail: '坐标置信度 > 95%' },
      state: { status: 'completed', detail: '结果已写入 DB' },
      observability: { status: 'success', detail: '耗时 2.1s, 成功率 100%' },
      takeover: { status: 'skipped', detail: '无需接管' }
    },
    cost: "¥ 0.05",
    latency: "2.1s"
  }
];

const CHART_DATA = [
  { time: '00:00', requests: 120, blocked: 2 },
  { time: '04:00', requests: 80, blocked: 0 },
  { time: '08:00', requests: 450, blocked: 12 },
  { time: '12:00', requests: 890, blocked: 25 },
  { time: '16:00', requests: 600, blocked: 15 },
  { time: '20:00', requests: 320, blocked: 5 },
  { time: '24:00', requests: 150, blocked: 1 },
];

export default function MissionControl() {
  const [activeFlowNode, setActiveFlowNode] = useState<string | null>(null);
  const [isFlowchartFullscreen, setIsFlowchartFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  // Filter States
  const [selectedCity, setSelectedCity] = useState('全部城市');
  const [selectedTime, setSelectedTime] = useState('最近 24 小时');
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Layout Settings
  const [showGrid, setShowGrid] = useState(true);
  const [enableFlow, setEnableFlow] = useState(true);

  const cities = ['全部城市', '北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市'];
  const timeRanges = ['最近 1 小时', '最近 24 小时', '最近 7 天', '最近 30 天', '自定义范围'];

  const handleRunPipeline = () => {
    setToast('流水线执行指令已发出，正在初始化节点...');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI-GeoOps</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* City Filter */}
          <div className="relative">
            <button 
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all group"
            >
              <MapPin className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium text-slate-700">{selectedCity}</span>
            </button>
            <AnimatePresence>
              {showCityMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                >
                  {cities.map(city => (
                    <button 
                      key={city}
                      onClick={() => { setSelectedCity(city); setShowCityMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${selectedCity === city ? 'text-red-600 font-bold bg-red-50/50' : 'text-slate-600'}`}
                    >
                      {city}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Filter */}
          <div className="relative">
            <button 
              onClick={() => setShowTimeMenu(!showTimeMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all group"
            >
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium text-slate-700">{selectedTime}</span>
            </button>
            <AnimatePresence>
              {showTimeMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                >
                  {timeRanges.map(range => (
                    <button 
                      key={range}
                      onClick={() => { setSelectedTime(range); setShowTimeMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${selectedTime === range ? 'text-red-600 font-bold bg-red-50/50' : 'text-slate-600'}`}
                    >
                      {range}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-slate-700 font-medium text-sm"
            >
              <Settings className="w-4 h-4" />
              布局设置
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 p-4 space-y-4"
                >
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">显示选项</div>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-600">显示网格背景</span>
                      <div 
                        onClick={() => setShowGrid(!showGrid)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${showGrid ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showGrid ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-600">启用动态流线</span>
                      <div 
                        onClick={() => setEnableFlow(!enableFlow)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${enableFlow ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${enableFlow ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </label>
                  </div>
                  <div className="pt-2 border-t border-slate-50">
                    <button 
                      onClick={() => { setShowGrid(true); setEnableFlow(true); }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                    >
                      重置布局
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleRunPipeline}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            执行流水线
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[#f8fafc]">
        <ProductionFlowchart 
          activeNode={activeFlowNode} 
          onNodeClick={(node) => setActiveFlowNode(node === activeFlowNode ? null : node)} 
          isFullscreen={isFlowchartFullscreen}
          onToggleFullscreen={() => setIsFlowchartFullscreen(!isFlowchartFullscreen)}
          showGrid={showGrid}
          enableFlow={enableFlow}
        />

        {/* Node Detail Panel */}
        <AnimatePresence>
          {activeFlowNode && (
            <NodeDetailPanel 
              node={activeFlowNode} 
              onClose={() => setActiveFlowNode(null)} 
              onOpenConsole={() => setShowConsole(activeFlowNode)}
            />
          )}
        </AnimatePresence>

        {/* Console Overlay */}
        <AnimatePresence>
          {showConsole && (
            <NodeConsole 
              node={showConsole} 
              onClose={() => setShowConsole(null)} 
            />
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <button className="absolute bottom-10 right-10 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-300 hover:scale-110 active:scale-95 transition-all z-30">
          <Plus className="w-8 h-8" />
        </button>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-600">核心引擎在线</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">自动化率</span>
              <span className="text-sm font-bold text-slate-800">92.4%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">日处理</span>
              <span className="text-sm font-bold text-slate-800">1.2M</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">AI-GeoOps 地图作业版权所有 © 2024</span>
        </div>
      </footer>
    </div>
  );
}

// --- Sub Components ---

// Removed unused KpiCard and HarnessCell
