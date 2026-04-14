import React, { useState } from 'react';
import { 
  Timer, Plus, Play, Pause, MoreVertical, Calendar, X, Activity, List, 
  Terminal, CircleCheck, CircleX, Clock, Mail, MapPin, Database, 
  ArrowRight, Search, ArrowLeft, CircleAlert, TriangleAlert, Layers, BarChart,
  BrainCircuit, ShieldCheck, ChevronRight, Workflow
} from 'lucide-react';
import { useDictionary } from '../contexts/DictionaryContext';

const INITIAL_TASKS = [
  { 
    id: 'da_001', 
    name: '每日增量POI数据清洗与分析', 
    production_line: 'POI产线',
    agent: '资料分析Agent', 
    schedule: '每天 10:00', 
    nextRun: '今天 10:00', 
    status: 'active',
    description: '每天上午10点定时从Kafka队列拉取新增POI数据，调用资料分析Agent进行清洗，分析数据质量并生成报告。',
    totalExecutions: 128,
    aiAnomalySummary: '发现 5 条POI缺失省市信息，已自动补全；3 条POI无法解析，已标记为异常。',
    anomalyData: [
      { id: 'a1', type: '缺失省市信息', count: 5, action: '已调用 LLM 自动推断补全', level: 'warning', requiresManual: false },
      { id: 'a2', type: 'POI无法解析', count: 3, action: '已拦截并标记为异常，等待人工处理', level: 'critical', requiresManual: true, status: 'pending', rawData: [
        { id: 'r1', address: '火星基地1号', reason: '超出地球范围' },
        { id: 'r2', address: '翻斗大街翻斗花园二号楼1001室', reason: '虚构地址' },
        { id: 'r3', address: '北京市朝阳区', reason: '缺少详细门牌号' }
      ]}
    ],
    workflow: [
      { step: 1, name: '拉取 Kafka 队列', type: 'Database', icon: Database },
      { step: 2, name: '资料分析Agent', type: 'Agent', icon: BrainCircuit },
      { step: 3, name: '数据质量校验', type: 'Validation', icon: ShieldCheck }
    ],
    batches: [
      { id: 'B-20260318-1000', startTime: '2026-03-18 10:00:00', endTime: '2026-03-18 10:02:15', status: 'success', records: 1250, aiAnomalySummary: '无异常', logs: '[2026-03-18 10:00:00] INFO: Task started...\n[2026-03-18 10:02:15] INFO: Task completed successfully.' },
      { id: 'B-20260317-1000', startTime: '2026-03-17 10:00:00', endTime: '2026-03-17 10:01:45', status: 'success', records: 980, aiAnomalySummary: '发现 2 条地址缺失省市信息，已自动补全。', logs: '[2026-03-17 10:00:00] INFO: Task started...\n[2026-03-17 10:01:45] INFO: Task completed successfully.' }
    ],
    logs: `[2026-03-18 10:00:00] INFO: Task started...
[2026-03-18 10:00:05] INFO: Fetched 1250 new address records from database.
[2026-03-18 10:00:10] INFO: Calling Data Analysis Agent...
[2026-03-18 10:02:00] INFO: Successfully cleaned 1245 records. 5 records failed validation.
[2026-03-18 10:02:15] INFO: Task completed successfully.`
  },
  { id: 'da_002', name: '楼栋轮廓识别质检分析', production_line: 'AOI/楼栋产线', agent: '图像识别Agent', schedule: '每天 08:00', nextRun: '今天 08:00', status: 'active', description: '每日早晨排查楼栋轮廓识别结果，分析置信度。', totalExecutions: 45, aiAnomalySummary: '昨日发现 2 处轮廓置信度低于 80%。', anomalyData: [], workflow: [], batches: [], logs: 'No logs available.' },
  { id: 'da_003', name: '路网拓扑一致性分析', production_line: '道路产线', agent: '拓扑分析Agent', schedule: '每周五 18:00', nextRun: '明天 18:00', status: 'active', description: '监控路网拓扑一致性。', totalExecutions: 12, aiAnomalySummary: '本周监测到 3 处拓扑异常。', anomalyData: [], workflow: [], batches: [], logs: 'No logs available.' },
  { id: 'da_004', name: '地址标准化率复盘分析', production_line: '地址产线', agent: '地址解析Agent', schedule: '每月最后一天 23:59', nextRun: '本月31日 23:59', status: 'paused', description: '复盘地址标准化率。', totalExecutions: 8, aiAnomalySummary: '上月解析失败率上升 1.5%。', anomalyData: [], workflow: [], batches: [], logs: 'No logs available.' },
];

export default function DataAnalysisCenter() {
  const { scenarios } = useDictionary();
  
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'logs'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [handlingAnomaly, setHandlingAnomaly] = useState<any>(null);

  const handleResolveAnomaly = () => {
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          anomalyData: t.anomalyData.map((a: any) => 
            a.id === handlingAnomaly.id 
              ? { ...a, status: 'resolved', action: '已人工修正并重新入库', level: 'info' } 
              : a
          )
        };
      }
      return t;
    }));
    
    setSelectedTask((prev: any) => ({
      ...prev,
      anomalyData: prev.anomalyData.map((a: any) => 
        a.id === handlingAnomaly.id 
          ? { ...a, status: 'resolved', action: '已人工修正并重新入库', level: 'info' } 
          : a
      )
    }));
    
    setHandlingAnomaly(null);
  };

  const lineFilteredTasks = selectedLines.length === 0 
    ? tasks 
    : tasks.filter(t => selectedLines.includes(t.production_line));

  const filteredTasks = lineFilteredTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || task.agent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleLine = (line: string) => {
    setSelectedLines(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const totalTasks = lineFilteredTasks.length;
  const activeTasks = lineFilteredTasks.filter(t => t.status === 'active').length;
  const pausedTasks = lineFilteredTasks.filter(t => t.status === 'paused').length;
  const totalExecutions = lineFilteredTasks.reduce((acc, task) => acc + (task.totalExecutions || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-200 shrink-0">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-red-500" />
                资料分析中心 (Data Analysis Center)
              </h1>
              <p className="text-slate-500 mt-1">按产线维度管理资料分析任务、数据质量监控与分析报告生成。</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              新建分析任务
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex w-full">
        {/* Left Sidebar Filters */}
        <div className="w-64 shrink-0 p-6 border-r border-slate-200 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-slate-800 mb-6">任务筛选</h2>
          
          {/* Production Line Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">所属产线</h3>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(line => (
                <button
                  key={line}
                  onClick={() => toggleLine(line)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedLines.includes(line)
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">{selectedLines.length === 0 ? '总任务数' : '筛选任务数'}</div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-slate-800">{totalTasks}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">运行中任务</div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Play className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-slate-800">{activeTasks}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">累计分析次数</div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-slate-800">{totalExecutions}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-500 font-medium text-sm">已暂停任务</div>
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Pause className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-slate-800">{pausedTasks}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索任务或智能体..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
                />
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  全部
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  运行中
                </button>
                <button
                  onClick={() => setStatusFilter('paused')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'paused' ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  已暂停
                </button>
              </div>
            </div>
          </div>
        
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="p-4 font-medium">任务名称</th>
                  <th className="p-4 font-medium">所属产线</th>
                  <th className="p-4 font-medium">执行智能体</th>
                  <th className="p-4 font-medium">调度规则</th>
                  <th className="p-4 font-medium">下次执行时间</th>
                  <th className="p-4 font-medium">状态</th>
                  <th className="p-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setActiveTab('overview');
                    }}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 group-hover:text-red-600 transition-colors">{task.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                        {task.production_line}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{task.agent}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {task.schedule}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{task.nextRun}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {task.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        {task.status === 'active' ? '运行中' : '已暂停'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500">没有找到匹配的任务</div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setSelectedTask(null); setSelectedBatch(null); }}>
          <div className="bg-white shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <BarChart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedTask.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      selectedTask.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {selectedTask.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {selectedTask.status === 'active' ? '运行中' : '已暂停'}
                    </span>
                    <span className="text-xs text-slate-500">{selectedTask.schedule}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedTask(null); setSelectedBatch(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-slate-100 bg-white">
              <button 
                onClick={() => { setActiveTab('overview'); setSelectedBatch(null); }}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <List className="w-4 h-4" />
                概览 (Overview)
              </button>
              <button 
                onClick={() => { setActiveTab('batches'); setSelectedBatch(null); }}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'batches' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Activity className="w-4 h-4" />
                分析批次 (Batches)
              </button>
              <button 
                onClick={() => { setActiveTab('logs'); setSelectedBatch(null); }}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Terminal className="w-4 h-4" />
                监控日志 (Logs)
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">任务描述</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedTask.description}</p>
                  </div>

                  {selectedTask.anomalyData && selectedTask.anomalyData.length > 0 && (
                    <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 shadow-sm">
                      <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                        <TriangleAlert className="w-4 h-4" />
                        异常分析说明 (AI 自动识别)
                      </h3>
                      <p className="text-sm text-red-600/90 leading-relaxed mb-4">
                        {selectedTask.aiAnomalySummary}
                      </p>
                      <div className="bg-white rounded-lg border border-red-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-red-50/50 border-b border-red-100 text-xs font-semibold text-red-700">
                              <th className="p-3">异常类型</th>
                              <th className="p-3">影响数量</th>
                              <th className="p-3">AI 处置动作</th>
                              <th className="p-3">风险等级</th>
                              <th className="p-3 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-50">
                            {selectedTask.anomalyData.map((anomaly: any, idx: number) => (
                              <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                <td className="p-3 text-sm text-slate-700 font-medium">{anomaly.type}</td>
                                <td className="p-3 text-sm text-slate-600">{anomaly.count}</td>
                                <td className="p-3 text-sm text-slate-600">{anomaly.action}</td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    anomaly.level === 'critical' ? 'bg-red-100 text-red-700' :
                                    anomaly.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {anomaly.level}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {anomaly.requiresManual && anomaly.status !== 'resolved' && (
                                    <button 
                                      onClick={() => setHandlingAnomaly(anomaly)}
                                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                      去处理
                                    </button>
                                  )}
                                  {anomaly.status === 'resolved' && (
                                    <span className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                                      <CircleCheck className="w-3 h-3" /> 已解决
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">执行工作流 (Workflow)</h3>
                    {selectedTask.workflow && selectedTask.workflow.length > 0 ? (
                      <div className="flex items-center gap-4">
                        {selectedTask.workflow.map((step: any, index: number) => {
                          const Icon = step.icon;
                          return (
                            <React.Fragment key={step.step}>
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm relative">
                                  <Icon className="w-5 h-5" />
                                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                    {step.step}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-bold text-slate-800">{step.name}</div>
                                  <div className="text-[10px] text-slate-500">{step.type}</div>
                                </div>
                              </div>
                              {index < selectedTask.workflow.length - 1 && (
                                <ArrowRight className="w-5 h-5 text-slate-300 mb-6" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">暂无工作流配置</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'batches' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {!selectedBatch ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">批次 ID</th>
                          <th className="p-4">开始时间</th>
                          <th className="p-4">结束时间</th>
                          <th className="p-4">处理记录数</th>
                          <th className="p-4">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTask.batches && selectedTask.batches.length > 0 ? (
                          selectedTask.batches.map((batch: any) => (
                            <tr key={batch.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedBatch(batch)}>
                              <td className="p-4 text-sm font-mono text-slate-600">{batch.id}</td>
                              <td className="p-4 text-sm text-slate-600">{batch.startTime}</td>
                              <td className="p-4 text-sm text-slate-600">{batch.endTime}</td>
                              <td className="p-4 text-sm text-slate-600">{batch.records}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  batch.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                  {batch.status === 'success' ? <CircleCheck className="w-3 h-3" /> : <CircleX className="w-3 h-3" />}
                                  {batch.status === 'success' ? '成功' : '失败'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-sm text-slate-500">暂无执行历史</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6">
                      <button 
                        onClick={() => setSelectedBatch(null)}
                        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        返回批次列表
                      </button>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-slate-800 font-mono">{selectedBatch.id}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            selectedBatch.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            {selectedBatch.status === 'success' ? <CircleCheck className="w-3 h-3" /> : <CircleX className="w-3 h-3" />}
                            {selectedBatch.status === 'success' ? '成功' : '失败'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">开始时间</div>
                            <div className="text-sm text-slate-800">{selectedBatch.startTime}</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">结束时间</div>
                            <div className="text-sm text-slate-800">{selectedBatch.endTime}</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">处理记录数</div>
                            <div className="text-sm text-slate-800">{selectedBatch.records}</div>
                          </div>
                        </div>

                        {selectedBatch.aiAnomalySummary && (
                          <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                            <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              批次异常总结
                            </h4>
                            <p className="text-sm text-red-600/90 leading-relaxed">{selectedBatch.aiAnomalySummary}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-500" />
                            批次执行日志
                          </h4>
                          <div className="bg-slate-900 rounded-xl shadow-inner overflow-hidden flex flex-col h-[280px]">
                            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <span className="text-xs text-slate-400 ml-2 font-mono">batch-{selectedBatch.id}.log</span>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                              {selectedBatch.logs || 'No logs available for this batch.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="bg-slate-900 rounded-xl shadow-inner overflow-hidden flex flex-col h-[400px]">
                  <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400 ml-2 font-mono">task-execution.log</span>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                    {selectedTask.logs}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Handling Anomaly Modal */}
      {handlingAnomaly && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <TriangleAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">人工处理异常数据</h2>
                  <p className="text-sm text-slate-500">异常类型: {handlingAnomaly.type}</p>
                </div>
              </div>
              <button onClick={() => setHandlingAnomaly(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              <div className="space-y-4">
                {handlingAnomaly.rawData && handlingAnomaly.rawData.map((data: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">ID: {data.id}</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{data.reason}</span>
                      </div>
                      <div className="text-sm text-slate-800 font-medium mb-2">{data.address}</div>
                      <input 
                        type="text" 
                        placeholder="输入修正后的地址..." 
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        defaultValue={data.address}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setHandlingAnomaly(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleResolveAnomaly}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <CircleCheck className="w-4 h-4" />
                保存修正并重新入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
