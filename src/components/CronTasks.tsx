import React, { useState } from 'react';
import { Timer, Plus, Play, Pause, MoreVertical, Calendar, X, Activity, List, Terminal, CheckCircle2, XCircle, Clock, Mail, MapPin, Database, ArrowRight, Search, ArrowLeft, AlertTriangle, Layers, ShieldCheck, GripVertical, BarChart2, ExternalLink } from 'lucide-react';
import { useDictionary } from '../contexts/DictionaryContext';
import { useTasks } from '../contexts/TaskContext';
import { useSops } from '../contexts/SopContext';
import { INITIAL_AGENTS } from './ClawStore';
import { SKILLS } from './SkillStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

function SortableWorkflowItem(props: { id: string, item: any, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = props.item.icon || MapPin;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
        {React.isValidElement(Icon) ? (
          React.cloneElement(Icon as React.ReactElement, { className: "w-4 h-4" })
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-slate-800">{props.item.name}</div>
        <div className="text-xs text-slate-500">{props.item.type}</div>
      </div>
      <button onClick={() => props.onRemove(props.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// INITIAL_TASKS moved to TaskContext.tsx

const TaskVisualization = ({ selectedLines }: { selectedLines: string[] }) => {
  // Mock data for different scenarios
  const overallData = [
    { name: 'POI产线', tasks: 12, successRate: 98, executions: 1250 },
    { name: '道路产线', tasks: 8, successRate: 95, executions: 840 },
    { name: '地址产线', tasks: 15, successRate: 99, executions: 2100 },
    { name: 'AOI/楼栋产线', tasks: 5, successRate: 92, executions: 320 },
  ];

  const poiAnomalyData = [
    { name: '缺失省市信息', value: 45 },
    { name: 'POI无法解析', value: 25 },
    { name: '层级关系不明确', value: 20 },
    { name: '边界范围模糊', value: 10 },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  const roadTrendData = [
    { date: '04-06', errors: 12 },
    { date: '04-07', errors: 8 },
    { date: '04-08', errors: 15 },
    { date: '04-09', errors: 5 },
    { date: '04-10', errors: 22 },
    { date: '04-11', errors: 9 },
    { date: '04-12', errors: 2 },
  ];

  const addressStandardizationData = [
    { date: '04-06', rate: 85 },
    { date: '04-07', rate: 86 },
    { date: '04-08', rate: 88 },
    { date: '04-09', rate: 87 },
    { date: '04-10', rate: 91 },
    { date: '04-11', rate: 93 },
    { date: '04-12', rate: 95 },
  ];

  // Determine which dashboard to show based on selected lines
  const isAllOrEmpty = selectedLines.length === 0 || selectedLines.includes('全部产线');
  const showPOI = isAllOrEmpty || selectedLines.includes('POI产线');
  const showRoad = isAllOrEmpty || selectedLines.includes('道路产线');
  const showAddress = isAllOrEmpty || selectedLines.includes('地址产线');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {isAllOrEmpty && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              各产线任务分布与执行量
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="executions" name="累计执行量" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar yAxisId="right" dataKey="tasks" name="任务数量" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              各产线任务成功率 (%)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="successRate" name="成功率" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {showPOI && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              POI产线 - 异常类型分布
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={poiAnomalyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {poiAnomalyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {showRoad && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              道路产线 - 路网断头/拓扑错误趋势 (近7天)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roadTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="errors" name="拓扑错误数" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorErrors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {showAddress && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              地址产线 - 地址标准化率提升趋势 (近7天)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={addressStandardizationData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="rate" name="标准化率 (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CronTasks() {
  const { scenarios } = useDictionary();
  const { tasks, setTasks, addTask, updateTask, deleteTask } = useTasks();
  const { sops } = useSops();
  const productionLines = ['全部产线', ...scenarios];
  
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'logs'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [handlingAnomaly, setHandlingAnomaly] = useState<any>(null);
  const [mainTab, setMainTab] = useState<'list' | 'visualization'>('list');
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editOverviewForm, setEditOverviewForm] = useState({ description: '', dashboardUrl: '' });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    production_line: scenarios[0] || 'POI产线',
    schedule: '',
    description: '',
    workflow: [] as any[],
    selectedSopId: ''
  });

  const availableNodes = [
    { id: 'base_1', name: '拉取 Kafka 队列', type: 'Database', icon: Database },
    { id: 'base_2', name: '人工作业', type: 'Manual', icon: Terminal },
    { id: 'base_3', name: '数据入库', type: 'Database', icon: Database },
    // 动态关联 Agent
    ...INITIAL_AGENTS.filter(agent => 
      agent.lines.includes('通用') || agent.lines.includes(createForm.production_line)
    ).map(agent => ({
      id: `agent_${agent.id}`,
      name: agent.name,
      type: 'Agent',
      icon: agent.icon
    })),
    // 动态关联 Skill
    ...SKILLS.filter(skill => 
      skill.scenarios.includes('通用') || skill.scenarios.includes(createForm.production_line)
    ).map(skill => ({
      id: `skill_${skill.id}`,
      name: skill.name,
      type: 'Skill',
      icon: skill.icon
    }))
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCreateForm((prev) => {
        const oldIndex = prev.workflow.findIndex((item) => item.uid === active.id);
        const newIndex = prev.workflow.findIndex((item) => item.uid === over.id);
        return {
          ...prev,
          workflow: arrayMove(prev.workflow, oldIndex, newIndex),
        };
      });
    }
  };

  const handleAddNode = (node: any) => {
    setCreateForm(prev => ({
      ...prev,
      workflow: [...prev.workflow, { ...node, uid: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
    }));
  };

  const handleRemoveNode = (uid: string) => {
    setCreateForm(prev => ({
      ...prev,
      workflow: prev.workflow.filter(item => item.uid !== uid)
    }));
  };

  const handleSopSelect = (sopId: string) => {
    if (!sopId) {
      setCreateForm({ ...createForm, selectedSopId: '', workflow: [] });
      return;
    }
    const sop = sops.find(s => s.id.toString() === sopId);
    if (sop) {
      const newWorkflow = sop.nodes.map((n: any) => ({
        ...n,
        uid: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      setCreateForm({
        ...createForm,
        selectedSopId: sopId,
        name: createForm.name || sop.name,
        production_line: sop.production_line,
        description: createForm.description || sop.description,
        workflow: newWorkflow
      });
    }
  };

  const handleCreateTask = () => {
    if (!createForm.name) return;
    
    const newTask = {
      id: Date.now(),
      name: createForm.name,
      production_line: createForm.production_line,
      agent: createForm.workflow.find(w => w.type === 'Agent')?.name || '自定义调度',
      schedule: createForm.schedule || '手动触发',
      nextRun: '等待调度',
      status: 'active',
      description: createForm.description,
      totalExecutions: 0,
      aiAnomalySummary: '',
      anomalyData: [],
      workflow: createForm.workflow.map((w, index) => ({ step: index + 1, name: w.name, type: w.type, icon: w.icon })),
      batches: [],
      logs: 'Task created.'
    };
    
    addTask(newTask);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: '',
      production_line: scenarios[0] || 'POI产线',
      schedule: '',
      description: '',
      workflow: [],
      selectedSopId: ''
    });
  };

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
                <Timer className="w-6 h-6 text-red-500" />
                任务调度监控 (Task Scheduling)
              </h1>
              <p className="text-slate-500 mt-1">按产线维度管理核心调度层的任务编排、Kafka队列监控与资料分析调度。</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMainTab('list')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mainTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  任务列表
                </button>
                <button 
                  onClick={() => setMainTab('visualization')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mainTab === 'visualization' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  任务可视化
                </button>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                新建任务
              </button>
            </div>
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
          {mainTab === 'visualization' ? (
            <TaskVisualization selectedLines={selectedLines} />
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-slate-500 font-medium text-sm">{selectedLines.length === 0 ? '总任务数' : '筛选任务数'}</div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Timer className="w-5 h-5" /></div>
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
                    <div className="text-slate-500 font-medium text-sm">累计执行总数</div>
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
                <th className="p-4 font-medium">执行智能体/技能</th>
                <th className="p-4 font-medium">调度规则</th>
                <th className="p-4 font-medium">下次执行时间</th>
                <th className="p-4 font-medium">监控大盘</th>
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
                    setEditOverviewForm({
                      description: task.description || '',
                      dashboardUrl: task.dashboardUrl || ''
                    });
                    setIsEditingOverview(false);
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
                    {task.dashboardUrl ? (
                      <a 
                        href={task.dashboardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        查看
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {task.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {task.status === 'active' ? '运行中' : '已暂停'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, { status: task.status === 'active' ? 'paused' : 'active' });
                        }}
                        title={task.status === 'active' ? '暂停任务' : '恢复任务'}
                      >
                        {task.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button 
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        title="删除任务"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500">没有找到匹配的任务</div>
            )}
          </div>
          </>
          )}
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
                  <Timer className="w-5 h-5" />
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
                执行批次 (Batches)
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
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
                    {!isEditingOverview ? (
                      <>
                        <button 
                          onClick={() => setIsEditingOverview(true)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium flex items-center gap-1"
                        >
                          编辑
                        </button>
                        <div className="mb-6">
                          <h3 className="text-sm font-bold text-slate-800 mb-2">任务描述</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{selectedTask.description || '暂无描述'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 mb-2">监控大盘</h3>
                          {selectedTask.dashboardUrl ? (
                            <a 
                              href={selectedTask.dashboardUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {selectedTask.dashboardUrl}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400">暂无配置监控大盘</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">任务描述</label>
                          <textarea 
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            rows={3}
                            value={editOverviewForm.description}
                            onChange={(e) => setEditOverviewForm({...editOverviewForm, description: e.target.value})}
                            placeholder="请输入任务描述..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">监控大盘 URL</label>
                          <input 
                            type="text"
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={editOverviewForm.dashboardUrl}
                            onChange={(e) => setEditOverviewForm({...editOverviewForm, dashboardUrl: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button 
                            onClick={() => setIsEditingOverview(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            取消
                          </button>
                          <button 
                            onClick={() => {
                              const updatedTasks = tasks.map(t => 
                                t.id === selectedTask.id 
                                  ? { ...t, description: editOverviewForm.description, dashboardUrl: editOverviewForm.dashboardUrl } 
                                  : t
                              );
                              setTasks(updatedTasks);
                              setSelectedTask({ ...selectedTask, description: editOverviewForm.description, dashboardUrl: editOverviewForm.dashboardUrl });
                              setIsEditingOverview(false);
                            }}
                            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTask.anomalyData && selectedTask.anomalyData.length > 0 && (
                    <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 shadow-sm">
                      <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        异常任务数据说明 (AI 自动识别)
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
                                      <CheckCircle2 className="w-3 h-3" /> 已解决
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
                                  {batch.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
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
                            {selectedBatch.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
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
                  <AlertTriangle className="w-5 h-5" />
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
                <CheckCircle2 className="w-4 h-4" />
                保存修正并重新入库
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-white shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-red-500" />
                  新建调度任务
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">配置任务基础信息与可视化工作流</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Form */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">基础信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">从SOP模板导入</label>
                    <select 
                      value={createForm.selectedSopId}
                      onChange={(e) => handleSopSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm bg-indigo-50/30 text-indigo-800"
                    >
                      <option value="">-- 不使用模板，自定义编排 --</option>
                      {sops.map(sop => (
                        <option key={sop.id} value={sop.id}>{sop.name} ({sop.production_line})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">任务名称 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="例如: 每日增量POI数据清洗"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">所属产线</label>
                    <select 
                      value={createForm.production_line}
                      onChange={(e) => setCreateForm({...createForm, production_line: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                    >
                      {scenarios.map(line => (
                        <option key={line} value={line}>{line}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">调度周期 (Cron/文本)</label>
                    <input 
                      type="text" 
                      value={createForm.schedule}
                      onChange={(e) => setCreateForm({...createForm, schedule: e.target.value})}
                      placeholder="例如: 每天 10:00 或 0 10 * * *"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">任务描述</label>
                    <textarea 
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      placeholder="描述该任务的具体用途..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm h-24 resize-none"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-8 mb-4">可用节点 (关联产线及通用)</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                  {availableNodes.map(node => {
                    const Icon = node.icon;
                    return (
                      <button 
                        key={node.id}
                        onClick={() => handleAddNode(node)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                          {React.isValidElement(Icon) ? (
                            React.cloneElement(Icon as React.ReactElement, { className: "w-4 h-4" })
                          ) : (
                            <Icon className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{node.name}</div>
                          <div className="text-[10px] text-slate-400">{node.type}</div>
                        </div>
                        <Plus className="w-3 h-3 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Visual Workflow */}
              <div className="w-1/2 bg-slate-50 p-6 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  工作流编排 (拖拽排序)
                </h3>
                
                <div className="flex-1 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-200 p-4 overflow-y-auto">
                  {createForm.workflow.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Layers className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">从左侧点击添加节点</p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={createForm.workflow.map(w => w.uid)} strategy={verticalListSortingStrategy}>
                        {createForm.workflow.map((item, index) => (
                          <div key={item.uid} className="relative">
                            <SortableWorkflowItem id={item.uid} item={item} onRemove={handleRemoveNode} />
                            {index < createForm.workflow.length - 1 && (
                              <div className="absolute left-7 -bottom-3 w-0.5 h-4 bg-slate-300 z-0"></div>
                            )}
                          </div>
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={!createForm.name}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                保存任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
