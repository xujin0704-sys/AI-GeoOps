import React, { useState } from 'react';
import { Bot, Store, BadgeDollarSign, Compass, ShieldAlert, RadioTower, Plus, X, BrainCircuit, Wrench, Settings2, Play, CheckCircle2, Radar, Network, MapPin, History, Download, UploadCloud } from 'lucide-react';
import VersionHistoryModal from './VersionHistoryModal';
import { useDictionary } from '../contexts/DictionaryContext';

const CATEGORIES = ['数据接入', '核心调度', '产线作业', '产线质检', '人工经验回流'];
const PRODUCTION_LINES = ['POI产线', 'AOI/楼栋产线', '道路产线', '地址产线', '通用'];

const MAIN_TABS = [
  { id: 'ALL', name: '全部' },
  { id: 'MY_AGENTS', name: '我的智能体' }
];

// Mock tools from SkillStore (Tool Registry)
const AVAILABLE_TOOLS = [
  { id: 'geo_core_01', name: 'Geo-LLM 地址大模型', toolName: 'ai-geoops_address_model', desc: '基于大模型的地址解析与纠错能力，支持极度模糊、错别字、非标地址的精准纠错、补全与坐标映射。', tags: ['大模型', '核心能力'] },
  { id: 'data_core_01', name: '高可信空间画像', toolName: 'ai-geoops_trusted_spatial_profile', desc: '融合政企合规数据源，提供高置信度的地块、小区、商圈的多维画像（人口、消费、业态）。', tags: ['数据处理', '核心能力'] },
  { id: 'geo_01', name: '标准地址解析 (Geocoding)', toolName: 'geocode_address', desc: '将结构化或标准文本地址转换为高精度经纬度坐标。', tags: ['空间计算'] },
  { id: 'route_01', name: '路径规划 (Routing)', toolName: 'calculate_route', desc: '计算两点或多点之间的直线距离或路网行驶距离。', tags: ['空间计算'] },
  { id: 'poi_01', name: 'POI 检索 (Places)', toolName: 'search_nearby_poi', desc: '基于坐标或关键词检索周边的兴趣点（如餐厅、医院、小区）。', tags: ['空间计算'] },
  { id: 'weather_01', name: '气象查询 (Weather)', toolName: 'get_weather_forecast', desc: '查询指定位置的实时气象与预报信息。', tags: ['数据接入'] },
  { id: 'poi_job_01', name: '大POI作业Skill', toolName: 'ai-geoops_large_poi_job', desc: '处理大POI核实任务的作业技能，包括信息补全、位置校准等。', tags: ['作业', '大模型'] },
  { id: 'poi_qa_01', name: '大POI质检Skill', toolName: 'ai-geoops_large_poi_qa', desc: '对大POI作业结果进行质量检查，识别大面积错误或需要人工核实的小面积错误。', tags: ['质检', '大模型'] },
];

export const INITIAL_AGENTS = [
  { 
    id: 'IntelligenceMining', 
    name: '情报挖掘数字员工Agent', 
    category: '数据接入', 
    desc: '从物流回流、丰行数据及其他来源中挖掘有价值的情报信息。', 
    detailedDesc: '该智能体具备强大的多源数据解析能力，能够从非结构化的物流回流文本、丰行轨迹数据以及外部公开信息中，自动识别并提取有价值的地理情报（如：新开业商铺、道路封闭、小区改名等）。提取的情报将作为基础数据，推送给后续的资料分析Agent进行结构化处理。',
    icon: <Radar className="w-6 h-6 text-blue-500" />, 
    users: '12.4k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个情报挖掘专家。你需要从多源数据中提取关键信息，为后续的资料分析提供基础数据。',
    tools: ['data_core_01'],
    lines: ['通用'],
    tags: ['数据处理', '自动化']
  },
  { 
    id: 'MapQualityInspection', 
    name: '图面质检数字员工Agent集群', 
    category: '数据接入', 
    desc: '对接入的图面数据进行初步质量检查。', 
    detailedDesc: '负责对所有新接入的图面数据（如卫星影像、路网矢量数据）进行第一道防线的质量把控。它可以自动检测数据的完整性、坐标系正确性以及是否存在明显的拓扑错误，确保流入下游产线的数据符合基本规范。',
    icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />, 
    users: '4.2k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个图面质检专家。你需要对接入的图面数据进行合规性和完整性检查。',
    tools: ['geo_core_01'],
    lines: ['通用'],
    tags: ['质检', '自动化']
  },
  { 
    id: 'DataAnalysis', 
    name: '资料分析Agent', 
    category: '核心调度', 
    desc: '对挖掘出的情报进行深度分析，清洗和结构化数据。', 
    detailedDesc: '作为数据中枢，该智能体接收来自情报挖掘Agent的原始数据，利用大模型进行深度语义理解、数据清洗、去重和结构化转换。处理后的标准数据将被统一推送到 Kafka 队列，供下游任务分发Agent调度。',
    icon: <BrainCircuit className="w-6 h-6 text-purple-500" />, 
    users: '8.2k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个资料分析专家。你需要对输入的数据进行清洗、去重和结构化处理，并将其推送到 Kafka 队列。',
    tools: ['geo_core_01'],
    lines: ['通用'],
    tags: ['数据处理', '大模型']
  },
  { 
    id: 'TaskDispatch', 
    name: '产线任务分发Agent', 
    category: '核心调度', 
    desc: '从 Kafka 队列消费数据，并根据任务类型分发给不同的作业集群。例如：识别到大POI核实任务，推送任务给POI作业Agent。', 
    detailedDesc: '系统的“交通警察”。它实时监听 Kafka 队列中的结构化任务数据，通过内置的规则引擎和大模型意图识别，准确判断任务类型（如：大POI核实、道路新增、地址纠错等），并将任务精准路由分发给对应的专业产线作业Agent集群，实现全自动的任务流转。',
    icon: <Network className="w-6 h-6 text-orange-500" />, 
    users: '24.1k',
    model: 'gemini-1.5-flash',
    systemPrompt: '你是一个任务调度专家。你需要根据数据的特征和类型，将其准确地分发给对应的产线作业 Agent 集群。',
    tools: [],
    lines: ['通用'],
    tags: ['自动化', '高频调用']
  },
  { 
    id: 'POIWorker', 
    name: 'POI数字作业员工Agent集群', 
    category: '产线作业', 
    desc: '处理 POI 相关的产线作业任务。可以做多种类型的工作，例如调用大POI作业Skill进行大POI核实任务。', 
    detailedDesc: '专注于POI（兴趣点）数据的精细化作业。当接收到“大POI核实任务”时，它会调用【大POI作业Skill】，自动提取商场/医院等大POI的边界范围、构建内部店铺层级关系、核实出入口位置，并交叉验证营业时间等属性。它具备多技能挂载能力，可适应不同类型的POI作业需求。',
    icon: <MapPin className="w-6 h-6 text-emerald-500" />, 
    users: '5.6k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个 POI 处理专家。你需要对分配给你的 POI 数据进行处理、补全和验证。',
    tools: ['poi_01', 'poi_job_01'],
    lines: ['POI产线'],
    tags: ['作业', '大模型']
  },
  { 
    id: 'POIQA', 
    name: 'POI数字质检员工Agent集群', 
    category: '产线质检', 
    desc: '对 POI 作业结果进行质量检查。例如调用大POI质检Skill检查大POI核实任务结果，没问题的入库，有问题的打回重做或推送人工。', 
    detailedDesc: 'POI产线的质量守门员。它接收POI作业Agent提交的批次结果，调用【大POI质检Skill】进行空间拓扑、逻辑一致性和属性完整性检查。对于完全合规的数据直接放行入库；若发现大面积错误，则将整个批次打回给作业Agent重做；若仅有少量疑点，则精准推送给人工进行兜底核实。',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, 
    users: '3.2k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个 POI 质检专家。你需要根据质检标准，对 POI 作业结果进行打分和判定，决定是否需要人工介入。',
    tools: ['poi_01', 'poi_qa_01'],
    lines: ['POI产线'],
    tags: ['质检', '大模型']
  },
  { 
    id: 'AOIWorker', 
    name: 'AOI/楼栋数字作业员工Agent集群', 
    category: '产线作业', 
    desc: '处理 AOI 及楼栋相关的产线作业任务。', 
    detailedDesc: '专门处理AOI（面状兴趣点）和楼栋轮廓的提取与属性补全。能够基于高分辨率影像和多源数据，自动生成或修正小区、学校、厂区等AOI的边界多边形，并关联内部楼栋信息。',
    icon: <Store className="w-6 h-6 text-emerald-500" />, 
    users: '4.8k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个 AOI/楼栋处理专家。你需要对分配给你的 AOI 及楼栋数据进行处理、补全和验证。',
    tools: ['geo_core_01'],
    lines: ['AOI/楼栋产线'],
    tags: ['作业', '空间计算']
  },
  { 
    id: 'AOIQA', 
    name: 'AOI/楼栋数字质检员工Agent集群', 
    category: '产线质检', 
    desc: '对 AOI/楼栋作业结果进行质量检查。', 
    detailedDesc: '负责AOI和楼栋数据的质量验收。重点检查面状数据的自相交、重叠、缝隙等空间拓扑错误，以及楼栋与所属AOI的包含关系是否合理。',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, 
    users: '2.9k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个 AOI/楼栋质检专家。你需要根据质检标准，对 AOI/楼栋作业结果进行打分和判定。',
    tools: ['geo_core_01'],
    lines: ['AOI/楼栋产线'],
    tags: ['质检']
  },
  { 
    id: 'RoadWorker', 
    name: '道路产线数字作业员工Agent集群', 
    category: '产线作业', 
    desc: '处理道路相关的产线作业任务。', 
    detailedDesc: '道路路网的构建与维护专家。负责处理道路新增、断头路连通、通行方向变更、限行规则更新等任务。可调用路径规划等工具验证路网的连通性。',
    icon: <Compass className="w-6 h-6 text-emerald-500" />, 
    users: '6.1k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个道路处理专家。你需要对分配给你的道路数据进行处理、补全和验证。',
    tools: ['route_01'],
    lines: ['道路产线'],
    tags: ['作业', '空间计算']
  },
  { 
    id: 'RoadQA', 
    name: '道路产线数字质检员工Agent集群', 
    category: '产线质检', 
    desc: '对道路作业结果进行质量检查。', 
    detailedDesc: '道路数据的质检员。通过模拟导航路径、检查路口连通关系、校验限行属性等方式，确保更新后的路网数据能够支持高精度的导航和路线规划。',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, 
    users: '3.5k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个道路质检专家。你需要根据质检标准，对道路作业结果进行打分和判定。',
    tools: ['route_01'],
    lines: ['道路产线'],
    tags: ['质检']
  },
  { 
    id: 'AddressWorker', 
    name: '地址数字作业员工Agent集群', 
    category: '产线作业', 
    desc: '处理地址解析、清洗和标准化任务。', 
    detailedDesc: '地址数据的处理引擎。挂载了Geo-LLM地址大模型，能够将用户输入的极度模糊、包含错别字或口语化的非标地址，精准解析为标准省市区街道格式，并映射到高精度的经纬度坐标。',
    icon: <MapPin className="w-6 h-6 text-emerald-500" />, 
    users: '9.1k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个地址处理专家。你需要调用地址大模型对模糊地址进行解析和标准化。',
    tools: ['geo_core_01', 'geo_01'],
    lines: ['地址产线'],
    tags: ['作业', '大模型', '空间计算']
  },
  { 
    id: 'AddressQA', 
    name: '地址数字质检员工Agent集群', 
    category: '产线质检', 
    desc: '对地址作业结果进行质量检查。', 
    detailedDesc: '地址解析结果的校验者。通过反向地理编码、周边POI交叉验证等手段，评估地址解析的准确率和坐标偏差，确保地址库的高质量。',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, 
    users: '4.7k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个地址质检专家。你需要根据质检标准，对地址作业结果进行打分和判定。',
    tools: ['geo_core_01', 'geo_01'],
    lines: ['地址产线'],
    tags: ['质检', '大模型']
  },
  { 
    id: 'ProfileWorker', 
    name: '位置画像作业员工Agent集群', 
    category: '产线作业', 
    desc: '处理位置画像相关的产线作业任务。', 
    detailedDesc: '商业地理分析专家。能够融合政企合规数据源，为指定的地块、小区或商圈构建多维度的画像，包括人口密度、消费能力、业态分布等，为商业选址提供数据支撑。',
    icon: <BrainCircuit className="w-6 h-6 text-emerald-500" />, 
    users: '3.4k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个位置画像处理专家。你需要对分配给你的位置数据进行画像构建。',
    tools: ['data_core_01'],
    lines: ['通用'],
    tags: ['作业', '数据处理']
  },
  { 
    id: 'ProfileQA', 
    name: '位置画像质检员工Agent集群', 
    category: '产线质检', 
    desc: '对位置画像作业结果进行质量检查。', 
    detailedDesc: '画像数据的审核员。通过对比历史数据趋势、校验数据逻辑一致性（如：某小区人口密度与建筑面积的比例是否合理），确保输出的位置画像真实可信。',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, 
    users: '1.8k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个位置画像质检专家。你需要根据质检标准，对位置画像作业结果进行打分和判定。',
    tools: ['data_core_01'],
    lines: ['通用'],
    tags: ['质检', '数据处理']
  },
  { 
    id: 'ExperienceCollection', 
    name: '人工经验收集Agent', 
    category: '人工经验回流', 
    desc: '收集八大丰人工作业的经验，并回流给数字员工。', 
    detailedDesc: '系统的“学习委员”。它持续监控人工兜底处理的疑难Case，利用大模型分析人工的作业轨迹和决策逻辑，自动提取新的规则和经验，并将其转化为数字员工可理解的知识库更新，实现系统的自我进化和闭环提升。',
    icon: <Bot className="w-6 h-6 text-slate-700" />, 
    users: '1.5k',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个经验学习专家。你需要分析人工处理的 case，提取规则和经验，并更新到数字员工的知识库中。',
    tools: [],
    lines: ['通用'],
    tags: ['人工兜底', '大模型']
  }
];

export default function ClawStore() {
  const { skillTags } = useDictionary();
  const [activeMainTab, setActiveMainTab] = useState('ALL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customAgents, setCustomAgents] = useState<any[]>([]);
  
  // Modal states
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versionModal, setVersionModal] = useState<{isOpen: boolean, data: any | null}>({ isOpen: false, data: null });
  
  // Agent Details Modal Tabs State
  const [activeTab, setActiveTab] = useState<'info' | 'versions' | 'playground'>('info');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', desc: '', detailedDesc: '', systemPrompt: '', tags: [] as string[] });
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [selectedTestVersion, setSelectedTestVersion] = useState('');
  const [testParams, setTestParams] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  const [builtInAgents, setBuiltInAgents] = useState(INITIAL_AGENTS);
  
  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    desc: '',
    detailedDesc: '',
    category: '我的智能体',
    model: 'gemini-1.5-pro',
    systemPrompt: '你是一个有用的空间智能助手。',
    tools: [] as string[],
    tags: [] as string[]
  });

  const allAgents = [...builtInAgents, ...customAgents];
  
  const filteredAgents = allAgents.filter(agent => {
    const matchesTab = activeMainTab === 'ALL' || (activeMainTab === 'MY_AGENTS' && agent.isCustom);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category);
    const matchesLine = selectedLines.length === 0 || (agent.lines && agent.lines.some((l: string) => selectedLines.includes(l)));
    const matchesTags = selectedTags.length === 0 || (agent.tags && selectedTags.every((t: string) => agent.tags.includes(t)));
    return matchesTab && matchesCategory && matchesLine && matchesTags;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLine = (line: string) => {
    setSelectedLines(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleTool = (toolId: string) => {
    if (createForm.tools.includes(toolId)) {
      setCreateForm({ ...createForm, tools: createForm.tools.filter(id => id !== toolId) });
    } else {
      setCreateForm({ ...createForm, tools: [...createForm.tools, toolId] });
    }
  };

  const openAgentDetails = (agent: any) => {
    setSelectedAgent(agent);
    setEditForm({
      name: agent.name,
      desc: agent.desc,
      detailedDesc: agent.detailedDesc || '',
      systemPrompt: agent.systemPrompt || '',
      tags: agent.tags || []
    });
    setSelectedTestVersion(agent.versionHistory?.[0]?.version || agent.version || 'v1.0.0');
    setActiveTab('info');
    setIsEditingInfo(false);
    setTestParams('');
    setTestResult('');
  };

  const handleSaveInfo = () => {
    const updatedAgent = {
      ...selectedAgent,
      name: editForm.name,
      desc: editForm.desc,
      detailedDesc: editForm.detailedDesc,
      systemPrompt: editForm.systemPrompt,
      tags: editForm.tags
    };
    
    setSelectedAgent(updatedAgent);
    
    if (updatedAgent.isCustom) {
      setCustomAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    } else {
      setBuiltInAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    }
    
    setIsEditingInfo(false);
  };

  const handleUploadVersion = () => {
    if (!newVersionDesc) return;
    setIsUploadingVersion(true);
    setTimeout(() => {
      setIsUploadingVersion(false);
      
      const currentVersion = selectedAgent.versionHistory?.[0]?.version || selectedAgent.version || 'v1.0.0';
      const parts = currentVersion.replace('v', '').split('.');
      const newVersionNum = `v${parts[0]}.${parseInt(parts[1] || '0') + 1}.0`;
      
      const newHistoryItem = {
        version: newVersionNum,
        date: new Date().toISOString().split('T')[0],
        author: 'Current User',
        changes: newVersionDesc.split('\n').filter(line => line.trim())
      };
      
      const updatedAgent = {
        ...selectedAgent,
        version: newVersionNum,
        versionHistory: [newHistoryItem, ...(selectedAgent.versionHistory || [])]
      };
      
      setSelectedAgent(updatedAgent);
      setNewVersionDesc('');
      
      if (updatedAgent.isCustom) {
        setCustomAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      } else {
        setBuiltInAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      }
    }, 800);
  };

  const handleTestAgent = () => {
    setIsTesting(true);
    setTestResult('');
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(JSON.stringify({
        status: 'success',
        version_used: selectedTestVersion,
        message: 'Agent executed successfully (Mocked)',
        data: { response: `This is a mock response from the agent for input: "${testParams}"` }
      }, null, 2));
    }, 1000);
  };

  const handleCreateAgent = () => {
    if (!createForm.name) return;
    
    setIsSaving(true);
    setTimeout(() => {
      const newAgent = {
        id: `custom_agent_${Date.now()}`,
        name: createForm.name,
        category: createForm.category,
        desc: createForm.desc,
        detailedDesc: createForm.detailedDesc,
        icon: <Bot className="w-6 h-6 text-indigo-500" />,
        users: '0',
        model: createForm.model,
        systemPrompt: createForm.systemPrompt,
        tools: createForm.tools,
        lines: ['通用'],
        tags: createForm.tags,
        isCustom: true,
        version: 'v1.0.0',
        versionHistory: [
          { version: 'v1.0.0', date: new Date().toISOString().split('T')[0], author: 'Current User', changes: ['初始版本发布'] }
        ]
      };
      
      setCustomAgents([...customAgents, newAgent]);
      setIsSaving(false);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '', desc: '', detailedDesc: '', category: '我的智能体', model: 'gemini-1.5-pro', systemPrompt: '你是一个有用的空间智能助手。', tools: [], tags: []
      });
      setActiveMainTab('MY_AGENTS');
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header and Tabs */}
      <div className="px-8 pt-8 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Bot className="w-6 h-6 text-red-500" />
                产线Agent管理 (Production Line Agents)
              </h1>
              <p className="text-slate-500 mt-1">开箱即用的空间智能体，覆盖选址、物流、风控等核心业务场景。</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              创建智能体
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {MAIN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
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
          <h2 className="text-base font-bold text-slate-800 mb-6">智能体筛选</h2>
          
          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">所属分类</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Production Line Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">所属产线</h3>
            <div className="flex flex-wrap gap-2">
              {PRODUCTION_LINES.map(line => (
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

          {/* Tags Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">智能体标签</h3>
            <div className="flex flex-wrap gap-2">
              {skillTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-slate-500">
              共 <span className="font-bold text-slate-800">{filteredAgents.length}</span> 个智能体
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map(agent => (
            <div 
              key={agent.id} 
              onClick={() => openAgentDetails(agent)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              {agent.isCustom && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  自定义
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {agent.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {agent.users} 使用
                  </span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap justify-end">
                    {agent.lines && agent.lines.map((line: string) => (
                      <span key={line} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {line}
                      </span>
                    ))}
                    <span className="text-[10px] font-medium text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md">
                      {agent.category}
                    </span>
                    {agent.version && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setVersionModal({ isOpen: true, data: agent }); }}
                        className="text-[10px] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <History className="w-3 h-3" />
                        {agent.version}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{agent.name}</h3>
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3 relative z-10">
                  {agent.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-500 leading-relaxed mb-4 h-10 line-clamp-2 flex-1">{agent.desc}</p>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                  {agent.tools.slice(0, 3).map((toolId: string, idx: number) => (
                    <div key={idx} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold" title={AVAILABLE_TOOLS.find(t => t.id === toolId)?.name}>
                      <Wrench className="w-3 h-3" />
                    </div>
                  ))}
                  {agent.tools.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      +{agent.tools.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 ml-1">{agent.tools.length} 个挂载工具</span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                  {selectedAgent.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedAgent.name}
                    {selectedAgent.isCustom && (
                      <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold">CUSTOM</span>
                    )}
                  </h2>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1.5 font-mono text-xs">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{selectedAgent.model}</span>
                    <span className="flex items-center gap-1"><Store className="w-3 h-3"/> {selectedAgent.category}</span>
                    <span>{selectedAgent.users} Users</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 bg-white px-6">
              <button 
                onClick={() => setActiveTab('info')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                基础信息
              </button>
              <button 
                onClick={() => setActiveTab('versions')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'versions' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                版本管理
              </button>
              <button 
                onClick={() => setActiveTab('playground')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'playground' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                智能体试用
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50/30">
              {activeTab === 'info' ? (
                <div className="p-6 space-y-8">
                  <div className="flex justify-end">
                    {!isEditingInfo ? (
                      <button onClick={() => setIsEditingInfo(true)} className="text-sm text-blue-500 hover:text-blue-600 font-medium">编辑基础信息</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingInfo(false)} className="text-sm text-slate-500 hover:text-slate-600">取消</button>
                        <button onClick={handleSaveInfo} className="text-sm text-blue-500 hover:text-blue-600 font-medium">保存</button>
                      </div>
                    )}
                  </div>

                  {isEditingInfo ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">智能体名称</label>
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">智能体简介</label>
                        <textarea value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg h-20 resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">智能体详细介绍</label>
                        <textarea value={editForm.detailedDesc} onChange={e => setEditForm({...editForm, detailedDesc: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="详细说明这个agent可以有哪些技能，做哪些类型的事情..." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">系统提示词</label>
                        <textarea value={editForm.systemPrompt} onChange={e => setEditForm({...editForm, systemPrompt: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">智能体标签</label>
                        <div className="flex flex-wrap gap-2">
                          {skillTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                setEditForm(prev => ({
                                  ...prev,
                                  tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                editForm.tags.includes(tag)
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2">智能体简介 (Description)</h3>
                        <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          {selectedAgent.desc}
                        </p>
                      </div>

                      {/* Detailed Description */}
                      {selectedAgent.detailedDesc && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 mb-2">智能体详细介绍 (Detailed Description)</h3>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {selectedAgent.detailedDesc}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* System Prompt */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-slate-400" />
                          系统提示词 (System Prompt)
                        </h3>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                          <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                            {selectedAgent.systemPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedAgent.tags && selectedAgent.tags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 mb-2">智能体标签 (Tags)</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedAgent.tags.map((tag: string) => (
                              <span key={tag} className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipped Tools */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-slate-400" />
                          挂载工具 (Equipped Tools)
                        </h3>
                        {selectedAgent.tools.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {selectedAgent.tools.map((toolId: string) => {
                              const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                              return tool ? (
                                <div key={toolId} className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-red-200 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                      <Wrench className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{tool.name}</p>
                                      <p className="text-[10px] font-mono text-slate-400">{tool.toolName}</p>
                                    </div>
                                  </div>
                                  {tool.desc && <p className="text-xs text-slate-500 leading-relaxed pl-11">{tool.desc}</p>}
                                  {tool.tags && tool.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pl-11 mt-1">
                                      {tool.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">该智能体未挂载任何外部工具。</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === 'versions' ? (
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6 bg-slate-100 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">上传新版本</h4>
                    <div className="space-y-3">
                      <textarea 
                        value={newVersionDesc}
                        onChange={e => setNewVersionDesc(e.target.value)}
                        placeholder="请输入版本更新说明 (每行一条)"
                        className="w-full p-3 text-sm border border-slate-200 rounded-lg h-20 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-red-400 hover:bg-red-50/30 transition-colors cursor-pointer bg-white">
                          <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-500">点击上传新版本 Agent 配置包</p>
                        </div>
                        <button 
                          onClick={handleUploadVersion}
                          disabled={isUploadingVersion || !newVersionDesc}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {isUploadingVersion ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                          发布版本
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedAgent.versionHistory?.map((v: any, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-slate-800">{v.version}</span>
                            <span className="text-xs text-slate-400">{v.date}</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v.author}</span>
                          </div>
                          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                            {v.changes.map((change: string, i: number) => (
                              <li key={i}>{change}</li>
                            ))}
                          </ul>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          下载配置
                        </button>
                      </div>
                    ))}
                    {(!selectedAgent.versionHistory || selectedAgent.versionHistory.length === 0) && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-slate-800">{selectedAgent.version || 'v1.0.0'}</span>
                            <span className="text-xs text-slate-400">初始版本</span>
                          </div>
                          <p className="text-sm text-slate-600">初始版本发布</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 flex-1 flex flex-col gap-6">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <label className="text-sm font-bold text-slate-700">测试版本:</label>
                    <select 
                      value={selectedTestVersion}
                      onChange={e => setSelectedTestVersion(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {selectedAgent.versionHistory?.map((v: any) => (
                        <option key={v.version} value={v.version}>{v.version}</option>
                      ))}
                      {(!selectedAgent.versionHistory || selectedAgent.versionHistory.length === 0) && (
                        <option value={selectedAgent.version || 'v1.0.0'}>{selectedAgent.version || 'v1.0.0'}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col min-h-[150px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">输入测试对话</h3>
                    <textarea 
                      value={testParams}
                      onChange={(e) => setTestParams(e.target.value)}
                      className="flex-1 w-full p-4 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none shadow-sm"
                      placeholder="例如：帮我分析一下这批POI数据..."
                    />
                    <button 
                      onClick={handleTestAgent}
                      disabled={isTesting || !testParams}
                      className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-slate-300"
                    >
                      {isTesting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isTesting ? '执行中...' : `执行测试 (${selectedTestVersion})`}
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col min-h-[200px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Agent 响应</h3>
                    <div className="flex-1 w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 overflow-auto shadow-inner">
                      {testResult ? (
                        <pre className="whitespace-pre-wrap break-words"><code>{testResult}</code></pre>
                      ) : (
                        <span className="text-slate-600">等待输入对话并执行...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAgent(null)} 
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
              >
                关闭
              </button>
              <button 
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" />
                在工作台中运行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-white shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-red-500" />
                  创建自定义智能体 (Create Agent)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">配置大模型提示词并挂载时空AI技能库中的工具</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Info */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">智能体名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="例如: 专属房产顾问"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">基础大模型 (Base Model)</label>
                  <select 
                    value={createForm.model}
                    onChange={(e) => setCreateForm({...createForm, model: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (推荐)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (快速)</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">智能体简介 (Description)</label>
                <input 
                  type="text" 
                  value={createForm.desc}
                  onChange={(e) => setCreateForm({...createForm, desc: e.target.value})}
                  placeholder="一句话描述这个智能体的用途"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-slate-400" />
                  系统提示词 (System Prompt) <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={createForm.systemPrompt}
                  onChange={(e) => setCreateForm({...createForm, systemPrompt: e.target.value})}
                  placeholder="设定智能体的角色、目标、工作流程以及输出格式..."
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm resize-none h-32 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">智能体标签</label>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setCreateForm(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        createForm.tags.includes(tag)
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    挂载工具 (Tool Registry)
                  </span>
                  <span className="text-xs font-normal text-slate-500">已选择 {createForm.tools.length} 个工具</span>
                </label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col gap-3">
                    {AVAILABLE_TOOLS.map(tool => {
                      const isSelected = createForm.tools.includes(tool.id);
                      return (
                        <div 
                          key={tool.id}
                          onClick={() => handleToggleTool(tool.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-red-50 border-red-200 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-red-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? 'text-red-900' : 'text-slate-700'}`}>
                              {tool.name}
                            </p>
                            <p className={`text-[10px] font-mono ${isSelected ? 'text-red-600/70' : 'text-slate-400'}`}>
                              {tool.toolName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    提示：您可以前往「产线Skills管理」注册更多自定义工具，注册后即可在此处挂载。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleCreateAgent}
                disabled={isSaving || !createForm.name}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存并发布'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Version History Modal */}
      <VersionHistoryModal 
        isOpen={versionModal.isOpen}
        onClose={() => setVersionModal({ isOpen: false, data: null })}
        title={versionModal.data?.name || ''}
        history={versionModal.data?.versionHistory || []}
      />
    </div>
  );
}
