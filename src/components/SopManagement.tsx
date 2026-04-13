import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, MapPin, Database, Mail, ShieldCheck, Terminal, Edit, Trash2, Save, X, GripVertical, History, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
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

  const Icon = props.item.icon || MapPin;

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
        <Icon className="w-4 h-4" />
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
  
  const [form, setForm] = useState({
    name: '',
    production_line: scenarios[0] || 'POI产线',
    description: '',
    nodes: [] as any[]
  });

  const availableNodes = [
    { id: 'base_1', name: '拉取 Kafka 队列', type: 'Database', icon: Database },
    { id: 'base_2', name: '人工作业', type: 'Manual', icon: Terminal },
    { id: 'base_3', name: '数据入库', type: 'Database', icon: Database },
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
        nodes: selectedSop.nodes.map((n: any) => ({ ...n, id: n.id || n.step.toString() }))
      });
    }
  }, [selectedSop, isEditingInSidebar]);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.nodes.findIndex((n) => n.id === active.id || n.step.toString() === active.id);
        const newIndex = prev.nodes.findIndex((n) => n.id === over.id || n.step.toString() === over.id);
        const newNodes = arrayMove(prev.nodes, oldIndex, newIndex);
        return { ...prev, nodes: newNodes.map((n, i) => ({ ...n, step: i + 1 })) };
      });
    }
  };

  const addNode = (node: any) => {
    const newNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      step: form.nodes.length + 1
    };
    setForm(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
  };

  const removeNode = (id: string) => {
    setForm(prev => {
      const newNodes = prev.nodes.filter(n => n.id !== id && n.step.toString() !== id);
      return { ...prev, nodes: newNodes.map((n, i) => ({ ...n, step: i + 1 })) };
    });
  };

  const openCreateModal = () => {
    setEditingSop(null);
    setForm({
      name: '',
      production_line: scenarios[0] || 'POI产线',
      description: '',
      nodes: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sop: any) => {
    setEditingSop(sop);
    setForm({
      name: sop.name,
      production_line: sop.production_line,
      description: sop.description,
      nodes: sop.nodes.map((n: any) => ({ ...n, id: n.id || n.step.toString() }))
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    
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
        description: versionNote || '更新了 SOP 流程'
      };

      const updates = {
        ...form,
        version: newVersion,
        versionHistory: [historyItem, ...(targetSop.versionHistory || [])]
      };

      updateSop(targetSop.id, updates);
      
      if (isEditingInSidebar) {
        setSelectedSop({ ...targetSop, ...updates });
        setIsEditingInSidebar(false);
        setVersionNote('');
      }
    } else {
      addSop(form);
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
                      <Edit className="w-3.5 h-3.5" />
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

      {/* SOP Details Modal */}
      {selectedSop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => { setSelectedSop(null); setIsEditingInSidebar(false); setActiveSidebarTab('info'); }}>
          <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {isEditingInSidebar ? '编辑 SOP' : selectedSop.name}
                  </h2>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1.5 font-mono text-xs">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{selectedSop.production_line}</span>
                    <span className="flex items-center gap-1">版本: {selectedSop.version || 'v1.0.0'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingInSidebar && (
                  <button 
                    onClick={() => setIsEditingInSidebar(true)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                )}
                <button onClick={() => { setSelectedSop(null); setIsEditingInSidebar(false); setActiveSidebarTab('info'); }} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isEditingInSidebar && (
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
              {isEditingInSidebar ? (
                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">SOP 名称</label>
                    <input 
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">SOP 描述</label>
                    <textarea 
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none h-24"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">节点编排 (Workflow)</h3>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={form.nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                          {form.nodes.map((node) => (
                            <SortableNodeItem key={node.id} id={node.id} item={node} onRemove={removeNode} />
                          ))}
                        </SortableContext>
                      </DndContext>
                      {form.nodes.length === 0 && (
                        <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                          暂无节点，请从下方添加
                        </div>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">可用节点 (关联产线及通用)</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {availableNodes.map(node => {
                        const Icon = node.icon;
                        return (
                          <button 
                            key={node.id}
                            onClick={() => addNode(node)}
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
                              <div className="text-[10px] font-bold text-slate-800 truncate">{node.name}</div>
                              <div className="text-[9px] text-slate-400">{node.type}</div>
                            </div>
                            <Plus className="w-3 h-3 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

                  {/* Workflow Nodes */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">标准作业流 (Workflow Nodes)</h3>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="space-y-4 relative">
                        {selectedSop.nodes.map((node: any, index: number) => {
                          const Icon = node.icon || MapPin;
                          return (
                            <div key={index} className="relative z-10">
                              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm shrink-0">
                                  {node.step}
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                  node.type === 'Agent' ? 'bg-indigo-100 text-indigo-600' :
                                  node.type === 'Database' ? 'bg-emerald-100 text-emerald-600' :
                                  node.type === 'Manual' ? 'bg-amber-100 text-amber-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {React.isValidElement(Icon) ? (
                                    React.cloneElement(Icon as React.ReactElement, { className: "w-5 h-5" })
                                  ) : (
                                    <Icon className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-slate-800">{node.name}</div>
                                  <div className="text-xs font-medium text-slate-500 mt-0.5">{node.type}</div>
                                </div>
                              </div>
                              {index < selectedSop.nodes.length - 1 && (
                                <div className="absolute left-4 top-11 w-0.5 h-6 bg-slate-200 -z-10"></div>
                              )}
                            </div>
                          );
                        })}
                        {selectedSop.nodes.length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            暂无节点编排
                          </div>
                        )}
                      </div>
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
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {v.description}
                      </p>
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

            {isEditingInSidebar && (
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setIsEditingInSidebar(false); setVersionNote(''); }}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!form.name}
                  className="px-6 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  保存并发布新版本
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                {editingSop ? '编辑 SOP' : '新建 SOP'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SOP 名称</label>
                  <input 
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="例如：标准POI清洗SOP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">所属产线</label>
                  <select 
                    value={form.production_line}
                    onChange={(e) => setForm({...form, production_line: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {scenarios.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">SOP 描述</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-24"
                    placeholder="描述该SOP的适用场景和主要流程..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">节点编排 (Workflow)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addNode('Database')} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> 数据节点
                    </button>
                    <button onClick={() => addNode('Agent')} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Agent节点
                    </button>
                    <button onClick={() => addNode('Manual')} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" /> 人工节点
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[200px]">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={form.nodes.map(n => n.id || n.step.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {form.nodes.map((node) => (
                        <SortableNodeItem 
                          key={node.id || node.step.toString()} 
                          id={node.id || node.step.toString()} 
                          item={node} 
                          onRemove={removeNode}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  {form.nodes.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      <Layers className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-sm">点击上方按钮添加节点</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSave}
                disabled={!form.name}
                className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                保存 SOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
