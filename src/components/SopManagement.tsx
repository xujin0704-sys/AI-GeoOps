import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Plus, Search, MapPin, Database, Mail, ShieldCheck, Terminal, Pencil, Trash2, Save, X, GripVertical, History, CircleCheck, CircleAlert, Clock, Info, UploadCloud, FileArchive, Download, FileCode, Code, Layout, GitBranch, MousePointer2 } from 'lucide-react';
import mermaid from 'mermaid';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Panel,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDictionary } from '../contexts/DictionaryContext';
import { useSops } from '../contexts/SopContext';
import { INITIAL_AGENTS } from './ClawStore';
import { SKILLS } from './SkillStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableNodeItem(props: { id: string, item: any, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderIcon = (icon: any, className: string = "w-4 h-4") => {
    if (!icon) return <MapPin className={className} />;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, { className });
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        props.item.type === 'Agent' ? 'bg-indigo-100 text-indigo-600' :
        props.item.type === 'Database' ? 'bg-emerald-100 text-emerald-600' :
        props.item.type === 'Manual' ? 'bg-amber-100 text-amber-600' :
        'bg-blue-100 text-blue-600'
      }`}>
        {renderIcon(props.item.icon)}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm text-slate-800">{props.item.name}</div>
        <div className="text-xs text-slate-500">{props.item.type}</div>
      </div>
      <button 
        onClick={() => props.onRemove(props.id)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Custom Node Component for ReactFlow
const SopFlowNode = ({ data }: any) => {
  if (!data) return null;
  const Icon = data.icon || MapPin;
  const isDecision = data.type === 'Decision';

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-white min-w-[150px] ${
      data.selected ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-white" />
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          data.type === 'Agent' ? 'bg-indigo-100 text-indigo-600' :
          data.type === 'Database' ? 'bg-emerald-100 text-emerald-600' :
          data.type === 'Manual' ? 'bg-amber-100 text-amber-600' :
          data.type === 'Decision' ? 'bg-rose-100 text-rose-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {Icon ? (typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : (React.isValidElement(Icon) ? React.cloneElement(Icon as React.ReactElement, { className: "w-5 h-5" }) : <MapPin className="w-5 h-5" />)) : <MapPin className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800 truncate">{data.label}</div>
          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{data.type}</div>
        </div>
      </div>

      {isDecision ? (
        <>
          <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-emerald-500 border-2 border-white left-1/4" />
          <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-rose-500 border-2 border-white left-3/4" />
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[8px] font-bold text-emerald-600">YES</span>
            <span className="text-[8px] font-bold text-rose-600">NO</span>
          </div>
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-2 border-white" />
      )}
    </div>
  );
};

const nodeTypes = {
  sopNode: SopFlowNode,
};

export default function SopManagement() {
  const { scenarios } = useDictionary();
  const { sops, addSop, updateSop, deleteSop } = useSops();
  const productionLines = scenarios;
  
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<any>(null);
  const [selectedSop, setSelectedSop] = useState<any | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'ALL' | 'MY_SOPS'>('ALL');
  const [isEditingInSidebar, setIsEditingInSidebar] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'info' | 'history'>('info');
  const [versionNote, setVersionNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<'visual' | 'mermaid'>('visual');
  const [mermaidCode, setMermaidCode] = useState('graph TD\n  A[开始] --> B[处理]\n  B --> C[结束]');
  
  // ReactFlow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const label = params.sourceHandle === 'yes' ? '是' : params.sourceHandle === 'no' ? '否' : '';
      return setEdges((eds) => addEdge({ 
        ...params, 
        animated: true,
        label: label,
        labelStyle: { fill: label === '是' ? '#059669' : label === '否' ? '#e11d48' : '#64748b', fontWeight: 700, fontSize: 10 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
      }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeDataStr = event.dataTransfer.getData('application/nodeData');

      if (typeof type === 'undefined' || !type || !rfInstance) {
        return;
      }

      const nodeData = JSON.parse(nodeDataStr);
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = rfInstance.screenToFlowPosition 
        ? rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
        : rfInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'sopNode',
        position,
        data: { 
          label: nodeData.name, 
          type: nodeData.type, 
          icon: nodeData.icon,
          originalId: nodeData.id
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (mermaidRef.current && workflowMode === 'mermaid') {
      mermaid.contentLoaded();
    }
  }, [mermaidCode, workflowMode, selectedSop, isCreating]);

  const [form, setForm] = useState({
    name: '',
    production_line: scenarios[0] || 'POI产线',
    description: '',
    nodes: [] as any[],
    edges: [] as any[],
    scriptPackage: null as { name: string, size: string, uploadDate: string } | null,
    mermaidCode: ''
  });

  const renderIcon = (icon: any, className: string = "w-5 h-5") => {
    if (!icon) return <MapPin className={className} />;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, { className });
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

  const availableNodes = [
    { id: 'base_1', name: '拉取 Kafka 队列', type: 'Database', icon: Database },
    { id: 'base_2', name: '人工作业', type: 'Manual', icon: Terminal },
    { id: 'base_3', name: '判断节点', type: 'Decision', icon: GitBranch },
    // 动态关联 Agent
    ...INITIAL_AGENTS.filter(agent => 
      agent.lines.includes('通用') || agent.lines.includes(form.production_line)
    ).map(agent => ({
      id: `agent_${agent.id}`,
      name: agent.name,
      type: 'Agent',
      icon: agent.icon
    })),
    // 动态关联 Skill
    ...SKILLS.filter(skill => 
      skill.scenarios.includes('通用') || skill.scenarios.includes(form.production_line)
    ).map(skill => ({
      id: `skill_${skill.id}`,
      name: skill.name,
      type: 'Skill',
      icon: skill.icon
    }))
  ];

  useEffect(() => {
    if (selectedSop && isEditingInSidebar) {
      setForm({
        name: selectedSop.name,
        production_line: selectedSop.production_line,
        description: selectedSop.description,
        nodes: selectedSop.nodes || [],
        edges: selectedSop.edges || [],
        scriptPackage: selectedSop.scriptPackage || null,
        mermaidCode: selectedSop.mermaidCode || ''
      });
      
      setNodes(selectedSop.nodes || []);
      setEdges(selectedSop.edges || []);

      if (selectedSop.mermaidCode) {
        setMermaidCode(selectedSop.mermaidCode);
        setWorkflowMode('mermaid');
      } else {
        setWorkflowMode('visual');
      }
    }
  }, [selectedSop, isEditingInSidebar, setNodes, setEdges]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSidebar = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPackage = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
        uploadDate: new Date().toISOString().split('T')[0]
      };
      setForm(prev => ({ ...prev, scriptPackage: newPackage }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleLine = (line: string) => {
    setSelectedLines(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const lineFilteredSops = selectedLines.length === 0 
    ? sops 
    : sops.filter(s => selectedLines.includes(s.production_line));

  const filteredSops = lineFilteredSops.filter(sop => {
    const matchesSearch = sop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeMainTab === 'ALL' || (activeMainTab === 'MY_SOPS' && sop.isCustom);
    return matchesSearch && matchesTab;
  });

  const generateMermaidFromFlow = (nodes: any[], edges: any[]) => {
    let code = 'graph TD\n';
    nodes.forEach(node => {
      const label = node.data.label.replace(/[\[\]\(\)]/g, '');
      if (node.data.type === 'Decision') {
        code += `  ${node.id}{${label}}\n`;
      } else {
        code += `  ${node.id}[${label}]\n`;
      }
    });
    edges.forEach(edge => {
      const label = edge.sourceHandle === 'yes' ? ' |是| ' : edge.sourceHandle === 'no' ? ' |否| ' : '';
      code += `  ${edge.source} -->${label}${edge.target}\n`;
    });
    return code;
  };

  const openCreateModal = () => {
    setEditingSop(null);
    setForm({
      name: '',
      production_line: scenarios[0] || 'POI产线',
      description: '',
      nodes: [],
      edges: [],
      scriptPackage: null,
      mermaidCode: 'graph TD\n  A[开始] --> B[处理]\n  B --> C[结束]'
    });
    setNodes([]);
    setEdges([]);
    setMermaidCode('graph TD\n  A[开始] --> B[处理]\n  B --> C[结束]');
    setWorkflowMode('visual');
    setIsCreating(true);
  };

  const openEditModal = (sop: any) => {
    setEditingSop(sop);
    setForm({
      name: sop.name,
      production_line: sop.production_line,
      description: sop.description,
      nodes: sop.nodes || [],
      edges: sop.edges || [],
      scriptPackage: sop.scriptPackage || null,
      mermaidCode: sop.mermaidCode || ''
    });
    setNodes(sop.nodes || []);
    setEdges(sop.edges || []);
    
    if (sop.mermaidCode) {
      setMermaidCode(sop.mermaidCode);
      setWorkflowMode('mermaid');
    } else {
      setWorkflowMode('visual');
    }
    setIsCreating(false);
    setIsEditingInSidebar(true);
    setSelectedSop(sop);
  };

  const handleSave = () => {
    if (!form.name) return;
    
    const currentNodes = nodes;
    const currentEdges = edges;
    
    const finalForm = {
      ...form,
      nodes: currentNodes,
      edges: currentEdges,
      mermaidCode: workflowMode === 'mermaid' ? mermaidCode : generateMermaidFromFlow(currentNodes, currentEdges)
    };
    
    if (editingSop || (selectedSop && isEditingInSidebar)) {
      const targetSop = editingSop || selectedSop;
      
      // Handle versioning
      const currentVersion = targetSop.version || 'v1.0.0';
      const parts = currentVersion.replace('v', '').split('.');
      const newVersion = `v${parts[0]}.${parseInt(parts[1] || '0') + 1}.0`;
      
      const historyItem = {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        author: 'Current User',
        description: versionNote || '更新了 SOP 流程',
        fileName: finalForm.scriptPackage?.name
      };

      const updates = {
        ...finalForm,
        version: newVersion,
        versionHistory: [historyItem, ...(targetSop.versionHistory || [])]
      };

      updateSop(targetSop.id, updates);
      
      if (isEditingInSidebar || isCreating) {
        setSelectedSop({ ...targetSop, ...updates });
        setIsEditingInSidebar(false);
        setIsCreating(false);
        setVersionNote('');
      }
    } else {
      addSop(finalForm);
      setIsCreating(false);
    }
    setIsModalOpen(false);
    setEditingSop(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header and Tabs */}
      <div className="px-8 pt-8 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-6 h-6 text-red-500" />
                产线SOP管理 (SOP Management)
              </h1>
              <p className="text-slate-500 mt-1">管理各产线的标准作业流程，为任务调度提供可复用的SOP模板。</p>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              新建 SOP
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', name: '全部' },
              { id: 'MY_SOPS', name: '我的 SOP' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeMainTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex w-full">
        {/* Left Sidebar Filters */}
        <div className="w-64 shrink-0 p-6 border-r border-slate-200 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-slate-800 mb-6">SOP 筛选</h2>
          
          {/* Production Line Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">所属产线</h3>
            <div className="flex flex-wrap gap-2">
              {productionLines.map(line => (
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

          {/* Search in Sidebar */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">关键词搜索</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="搜索SOP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-slate-500">
              共 <span className="font-bold text-slate-800">{filteredSops.length}</span> 个SOP
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSops.map(sop => (
              <div 
                key={sop.id} 
                onClick={() => setSelectedSop(sop)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group cursor-pointer flex flex-col h-full relative overflow-hidden"
              >
                {sop.isCustom && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    自定义
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      {Math.floor(Math.random() * 1000)} 使用
                    </span>
                    <div className="flex items-center gap-1 mt-1 flex-wrap justify-end">
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {sop.production_line}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">{sop.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                  {sop.description}
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Layers className="w-3 h-3" />
                    {sop.nodes.length} 个节点
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(sop); }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSop(sop.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSops.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">没有找到SOP</h3>
                <p className="text-slate-500">尝试调整搜索词或产线筛选条件</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOP Details / Create / Edit Sidebar */}
      {(selectedSop || isCreating) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => { setSelectedSop(null); setIsEditingInSidebar(false); setIsCreating(false); setActiveSidebarTab('info'); }}>
          <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {isCreating ? '新建 SOP' : (isEditingInSidebar ? '编辑 SOP' : selectedSop.name)}
                  </h2>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1.5 font-mono text-xs">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                      {isCreating ? form.production_line : selectedSop.production_line}
                    </span>
                    {!isCreating && <span className="flex items-center gap-1">版本: {selectedSop.version || 'v1.0.0'}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingInSidebar && !isCreating && (
                  <button 
                    onClick={() => setIsEditingInSidebar(true)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    编辑
                  </button>
                )}
                <button onClick={() => { setSelectedSop(null); setIsEditingInSidebar(false); setIsCreating(false); setActiveSidebarTab('info'); }} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isEditingInSidebar && !isCreating && (
              <div className="flex border-b border-slate-100 bg-white px-6">
                <button 
                  onClick={() => setActiveSidebarTab('info')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'info' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  基础信息
                </button>
                <button 
                  onClick={() => setActiveSidebarTab('history')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'history' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  变更记录
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {(isEditingInSidebar || isCreating) ? (
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">SOP 名称</label>
                      <input 
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        placeholder="请输入 SOP 名称"
                      />
                    </div>
                    {isCreating && (
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">所属产线</label>
                        <select 
                          value={form.production_line}
                          onChange={(e) => setForm({...form, production_line: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                        >
                          {scenarios.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">SOP 描述</label>
                    <textarea 
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none h-24"
                      placeholder="请输入 SOP 描述"
                    />
                  </div>

                  {/* Script Package Upload in Sidebar */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">工作流脚本包 (Workflow Script)</label>
                    <div 
                      onClick={() => sidebarFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group"
                    >
                      <input 
                        type="file" 
                        ref={sidebarFileInputRef} 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, true)}
                        accept=".zip,.rar,.7z,.tar.gz"
                      />
                      {form.scriptPackage ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                            <FileArchive className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">{form.scriptPackage.name}</div>
                            <div className="text-xs text-slate-500">{form.scriptPackage.size} • {form.scriptPackage.uploadDate}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, scriptPackage: null })); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2">
                          <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-red-400 mb-2 transition-colors" />
                          <p className="text-xs text-slate-500">点击或拖拽上传脚本包 (.zip, .rar)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800">标准作业流 (Workflow)</h3>
                      <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button 
                          onClick={() => setWorkflowMode('visual')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${workflowMode === 'visual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          <Layout className="w-3.5 h-3.5" /> 可视化编排
                        </button>
                        <button 
                          onClick={() => setWorkflowMode('mermaid')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${workflowMode === 'mermaid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          <Code className="w-3.5 h-3.5" /> Mermaid 代码
                        </button>
                      </div>
                    </div>

                    {workflowMode === 'visual' ? (
                      <div className="space-y-4">
                        <div ref={reactFlowWrapper} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                          <div className="flex-1 relative bg-slate-50">
                              <ReactFlow
                                nodes={(nodes || []).filter(n => n && n.position)}
                                edges={(edges || []).filter(e => {
                                  const nodeIds = new Set((nodes || []).filter(n => n && n.position).map(n => n.id));
                                  return nodeIds.has(e.source) && nodeIds.has(e.target);
                                })}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onInit={setRfInstance}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                nodeTypes={nodeTypes}
                                fitView
                              >
                                <Background color="#cbd5e1" gap={20} />
                                <Controls />
                                <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-200 shadow-sm flex gap-2">
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MousePointer2 className="w-3 h-3" /> 拖拽左侧节点到画布
                                  </div>
                                </Panel>
                              </ReactFlow>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">可用节点 (拖拽添加)</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                          {availableNodes.map(node => {
                            return (
                              <div 
                                key={node.id}
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData('application/reactflow', 'sopNode');
                                  event.dataTransfer.setData('application/nodeData', JSON.stringify(node));
                                  event.dataTransfer.effectAllowed = 'move';
                                }}
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-left transition-colors group cursor-grab active:cursor-grabbing bg-white"
                              >
                                <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                  {renderIcon(node.icon, "w-4 h-4")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-slate-800 truncate">{node.name}</div>
                                  <div className="text-[9px] text-slate-400">{node.type}</div>
                                </div>
                                <GripVertical className="w-3 h-3 text-slate-300" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <textarea 
                            value={mermaidCode}
                            onChange={(e) => setMermaidCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono text-xs h-48 bg-slate-900 text-slate-300"
                            placeholder="graph TD\n  A[开始] --> B[处理]"
                          />
                          <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                            Mermaid Syntax
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                          <div className="mermaid flex justify-center" ref={mermaidRef}>
                            {mermaidCode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isCreating && (
                    <div className="pt-6 border-t border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        版本说明 (Version Note)
                      </label>
                      <textarea 
                        value={versionNote}
                        onChange={(e) => setVersionNote(e.target.value)}
                        placeholder="请简要说明本次修改内容，提交后将自动生成新版本..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none h-20 text-sm"
                      />
                    </div>
                  )}
                </div>
              ) : activeSidebarTab === 'info' ? (
                <div className="max-w-xl mx-auto space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">SOP 简介 (Description)</h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      {selectedSop.description || '暂无描述'}
                    </p>
                  </div>

                  {/* Script Package Download */}
                  {selectedSop.scriptPackage && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">工作流脚本包 (Script Package)</h3>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                            <FileArchive className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{selectedSop.scriptPackage.name}</div>
                            <div className="text-xs text-slate-500">{selectedSop.scriptPackage.size} • 上传于 {selectedSop.scriptPackage.uploadDate}</div>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-sm font-medium transition-all">
                          <Download className="w-4 h-4" />
                          下载脚本包
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Workflow Nodes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800">标准作业流 (Workflow)</h3>
                      {selectedSop.mermaidCode && (
                        <div className="flex bg-slate-200 p-1 rounded-lg">
                          <button 
                            onClick={() => setWorkflowMode('visual')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${workflowMode === 'visual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <Layout className="w-3.5 h-3.5" /> 流程图
                          </button>
                          <button 
                            onClick={() => setWorkflowMode('mermaid')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${workflowMode === 'mermaid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <Code className="w-3.5 h-3.5" /> Mermaid
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                      {workflowMode === 'mermaid' ? (
                        <div className="p-5 overflow-x-auto flex justify-center">
                          <div className="mermaid" ref={mermaidRef}>
                            {selectedSop.mermaidCode}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 relative bg-slate-50">
                          <ReactFlow
                            nodes={(selectedSop.nodes || []).filter((n: any) => n && n.position)}
                            edges={(selectedSop.edges || []).filter((e: any) => {
                              const nodeIds = new Set((selectedSop.nodes || []).filter((n: any) => n && n.position).map((n: any) => n.id));
                              return nodeIds.has(e.source) && nodeIds.has(e.target);
                            })}
                            nodeTypes={nodeTypes}
                            fitView
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnDrag={true}
                            zoomOnScroll={true}
                          >
                            <Background color="#cbd5e1" gap={20} />
                          </ReactFlow>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-4">
                  {selectedSop.versionHistory?.map((v: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{v.version}</span>
                          <span className="ml-3 text-xs text-slate-400">{v.date}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{v.author}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-2">
                        {v.description}
                      </p>
                      {v.fileName && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                          <FileCode className="w-3 h-3" />
                          关联脚本: {v.fileName}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!selectedSop.versionHistory || selectedSop.versionHistory.length === 0) && (
                    <div className="text-center py-12 text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>暂无变更记录</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(isEditingInSidebar || isCreating) && (
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setIsEditingInSidebar(false); setIsCreating(false); setVersionNote(''); }}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!form.name}
                  className="px-6 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <CircleCheck className="w-4 h-4" />
                  {isCreating ? '创建并发布' : '保存并发布新版本'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy Create/Edit Modal - Removed as requested */}
      {/* isModalOpen && (...) */}
    </div>
  );
}
