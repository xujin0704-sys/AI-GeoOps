import React, { useState } from 'react';
import { BrainCircuit, Globe2, ScanSearch, CloudLightning, Route, Hexagon, Plus, X, Search, Code2, Webhook, FileJson, CheckCircle2, TerminalSquare, Database, Play, ShieldCheck, Lock, Sparkles, MapPin, Settings2, Layers, History, UploadCloud, Download } from 'lucide-react';
import { useDictionary } from '../contexts/DictionaryContext';
import VersionHistoryModal from './VersionHistoryModal';

const SKILLS = [
  // 产线作业技能
  {
    id: 'poi_job_01',
    name: '大POI作业Skill',
    toolName: 'ai-geoops_large_poi_job',
    category: '产线作业技能',
    scenarios: ['POI产线'],
    type: 'SKILL',
    desc: '处理大POI核实任务的作业技能，包括信息补全、位置校准等。',
    detailedDesc: '支持对各类大型面状POI（如商场、医院、学校、景区、产业园区、交通枢纽等）进行深度信息核实与空间校准。具体能力包括：\n1. 边界范围（Polygon）精准提取与校准；\n2. 内部层级关系（如商场内的店铺、医院内的科室楼）构建与关联；\n3. 出入口（AOI/门点）位置核实与补充；\n4. 营业时间、联系方式等基础属性的多源交叉验证与补全；\n5. 废弃/拆迁大POI的识别与状态更新。',
    tags: ['大模型', '作业', '数据处理'],
    llmPrompt: '当需要对大POI进行核实、信息补全和位置校准时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "poi_id": { "type": "string" },\n    "poi_data": { "type": "object" }\n  },\n  "required": ["poi_id", "poi_data"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/poi/large-job",\n    json={"poi_id": "123", "poi_data": {}},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <MapPin className="w-6 h-6 text-emerald-500" />,
    isCore: true,
    version: 'v1.0.0',
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-01', author: 'POI Team', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'atomic_01',
    name: '地理编码 (Geocoding)',
    toolName: 'ai-geoops_geocode',
    category: '产线作业技能',
    scenarios: ['地址产线', 'POI产线'],
    type: 'API',
    desc: '将结构化或标准文本地址转换为高精度经纬度坐标。',
    tags: ['空间计算', '高频调用', '核心能力'],
    llmPrompt: '当你需要获取某个具体地点、建筑或街道的精确经纬度坐标时，请调用此工具。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "address": {\n      "type": "string",\n      "description": "需要解析的详细地址"\n    }\n  },\n  "required": ["address"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/geocode",\n    json={"address": "北京市海淀区上地十街10号"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <Globe2 className="w-6 h-6 text-blue-500" />,
    isCore: false,
    version: 'v2.1.0',
    versionHistory: [
      { version: 'v2.1.0', date: '2023-11-10', author: 'API Team', changes: ['提升了批量解析的并发能力', '优化了长地址的解析准确率'] },
      { version: 'v2.0.0', date: '2023-08-15', author: 'API Team', changes: ['重构了底层解析引擎', '支持了更多方言地址'] },
      { version: 'v1.0.0', date: '2023-01-10', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'atomic_02',
    name: '坐标转换 (Coordinate Transform)',
    toolName: 'ai-geoops_coord_transform',
    category: '产线作业技能',
    scenarios: ['地址产线', '道路产线', 'POI产线'],
    type: 'API',
    desc: '在 WGS84、GCJ02、BD09 等不同坐标系之间进行高精度转换。',
    tags: ['空间计算', '高频调用'],
    llmPrompt: '当需要将GPS坐标转换为火星坐标系或百度坐标系时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "lat": { "type": "number" },\n    "lng": { "type": "number" },\n    "from": { "type": "string", "enum": ["WGS84", "GCJ02", "BD09"] },\n    "to": { "type": "string", "enum": ["WGS84", "GCJ02", "BD09"] }\n  },\n  "required": ["lat", "lng", "from", "to"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/transform",\n    json={"lat": 39.9042, "lng": 116.4074, "from": "WGS84", "to": "GCJ02"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <MapPin className="w-6 h-6 text-indigo-500" />,
    isCore: false,
    version: 'v1.0.5',
    versionHistory: [
      { version: 'v1.0.5', date: '2023-10-05', author: 'API Team', changes: ['修复了极地坐标转换的精度问题'] },
      { version: 'v1.0.0', date: '2023-02-20', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'atomic_03',
    name: 'POI 查询 (POI Lookup)',
    toolName: 'ai-geoops_poi_search',
    category: '产线作业技能',
    scenarios: ['POI产线', '位置画像产线'],
    type: 'API',
    desc: '基于坐标或关键词检索周边的兴趣点（如餐厅、医院、小区）。',
    tags: ['空间计算', '高频调用'],
    llmPrompt: '当需要查找某个位置附近的特定类型场所时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "location": { "type": "string", "description": "中心点坐标 (lat,lng)" },\n    "keyword": { "type": "string", "description": "搜索关键词" },\n    "radius": { "type": "number", "description": "搜索半径（米）" }\n  },\n  "required": ["location", "keyword"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/poi/search",\n    json={"location": "39.9042,116.4074", "keyword": "咖啡厅", "radius": 1000},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <ScanSearch className="w-6 h-6 text-orange-500" />,
    isCore: false,
    version: 'v1.5.0',
    versionHistory: [
      { version: 'v1.5.0', date: '2023-11-01', author: 'POI Team', changes: ['新增了按类别过滤的功能', '优化了搜索结果的排序算法'] },
      { version: 'v1.0.0', date: '2023-03-15', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'atomic_04',
    name: '空间距离计算 (Distance Calculation)',
    toolName: 'ai-geoops_distance',
    category: '产线作业技能',
    scenarios: ['道路产线', 'AOI/楼栋产线'],
    type: 'API',
    desc: '计算两点或多点之间的直线距离或路网行驶距离。',
    tags: ['空间计算', '高频调用'],
    llmPrompt: '当需要计算两个坐标点之间的实际物理距离时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "origin": { "type": "string", "description": "起点坐标 (lat,lng)" },\n    "destination": { "type": "string", "description": "终点坐标 (lat,lng)" },\n    "type": { "type": "string", "enum": ["straight", "driving", "walking"] }\n  },\n  "required": ["origin", "destination"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/distance",\n    json={"origin": "39.9042,116.4074", "destination": "39.915,116.404", "type": "driving"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <Route className="w-6 h-6 text-emerald-500" />,
    isCore: false,
    version: 'v1.2.0',
    versionHistory: [
      { version: 'v1.2.0', date: '2023-09-20', author: 'Routing Team', changes: ['支持了多点距离矩阵计算'] },
      { version: 'v1.0.0', date: '2023-04-10', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },

  // 核心调度技能
  {
    id: 'composite_01',
    name: '地址治理 (Address Cleaning)',
    toolName: 'ai-geoops_address_cleaning',
    category: '核心调度技能',
    scenarios: ['地址产线'],
    type: 'SKILL',
    desc: '基于 AI-GeoOps-LLM 大模型，支持极度模糊、错别字、非标地址的精准纠错、补全与坐标映射。',
    tags: ['大模型', '核心能力', '数据处理'],
    llmPrompt: '当用户提供的地址非常模糊、包含错别字、或者是口语化的描述时，必须调用此工具进行精准的语义解析和坐标转换。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "raw_address": {\n      "type": "string",\n      "description": "用户输入的原始模糊或口语化地址"\n    }\n  },\n  "required": ["raw_address"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/address/clean",\n    json={"raw_address": "北京大裤衩旁边那个商场"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <BrainCircuit className="w-6 h-6 text-red-500" />,
    isCore: true,
    version: 'v3.0.0',
    versionHistory: [
      { version: 'v3.0.0', date: '2023-11-15', author: 'AI Team', changes: ['升级至最新的 AI-GeoOps-LLM 架构', '纠错准确率提升了 15%'] },
      { version: 'v2.0.0', date: '2023-07-20', author: 'AI Team', changes: ['引入了上下文感知模型'] },
      { version: 'v1.0.0', date: '2023-01-05', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'composite_02',
    name: '配送可行性分析 (Delivery Feasibility)',
    toolName: 'ai-geoops_delivery_check',
    category: '核心调度技能',
    scenarios: ['道路产线', '位置画像产线'],
    type: 'SKILL',
    desc: '综合路网、限行、天气与地形数据，评估特定起点到终点的配送可行性与预估成本。',
    tags: ['自动化', '核心能力'],
    llmPrompt: '当需要判断某笔订单是否可以配送，或者评估配送难度和成本时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "origin": { "type": "string" },\n    "destination": { "type": "string" },\n    "vehicle_type": { "type": "string", "enum": ["ebike", "car", "truck"] }\n  },\n  "required": ["origin", "destination", "vehicle_type"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/delivery/feasibility",\n    json={"origin": "39.9042,116.4074", "destination": "39.915,116.404", "vehicle_type": "ebike"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <ShieldCheck className="w-6 h-6 text-cyan-500" />,
    isCore: true,
    version: 'v2.1.0',
    versionHistory: [
      { version: 'v2.1.0', date: '2023-10-25', author: 'Logistics Team', changes: ['新增了实时天气对配送影响的评估'] },
      { version: 'v2.0.0', date: '2023-06-15', author: 'Logistics Team', changes: ['重构了成本预估模型'] },
      { version: 'v1.0.0', date: '2023-02-10', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'composite_03',
    name: '高可信空间画像 (Trusted Spatial Profile)',
    toolName: 'ai-geoops_trusted_spatial_profile',
    category: '数据接入技能',
    scenarios: ['位置画像产线', 'AOI/楼栋产线'],
    type: 'MCP',
    desc: '融合政企合规数据源，提供高置信度的地块、小区、商圈的多维画像（人口、消费、业态）。',
    tags: ['数据处理', '核心能力'],
    llmPrompt: '当需要进行商业选址、客流评估，需要获取某个坐标点周边绝对真实、可信的人口画像和消费能力数据时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "location": {\n      "type": "string",\n      "description": "中心点坐标 (lat,lng)"\n    },\n    "radius": {\n      "type": "number",\n      "description": "分析半径（米）"\n    }\n  },\n  "required": ["location"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/spatial/profile",\n    json={"location": "39.9042,116.4074", "radius": 1000},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <Database className="w-6 h-6 text-emerald-500" />,
    isCore: true,
    version: 'v1.8.0',
    versionHistory: [
      { version: 'v1.8.0', date: '2023-11-20', author: 'Data Team', changes: ['接入了最新的全国人口普查数据', '优化了商圈业态分类'] },
      { version: 'v1.0.0', date: '2023-05-05', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },

  // 产线质检技能
  {
    id: 'poi_qa_01',
    name: '大POI质检Skill',
    toolName: 'ai-geoops_large_poi_qa',
    category: '产线质检技能',
    scenarios: ['POI产线'],
    type: 'SKILL',
    desc: '对大POI作业结果进行质量检查，识别大面积错误或需要人工核实的小面积错误。',
    detailedDesc: '针对大POI作业结果进行多维度的自动化质量检查。具体能力包括：\n1. 空间拓扑检查：识别边界重叠、自相交、出入口不在边界上等空间错误；\n2. 逻辑一致性检查：校验父子POI层级关系是否合理（如子POI超出父POI边界）；\n3. 属性完整性与合规性检查：校验必填字段、敏感词拦截；\n4. 异常分流：根据错误类型和置信度，自动判定为“大面积错误（打回重做）”、“小面积错误（推送人工核实）”或“通过（入库）”。',
    tags: ['大模型', '质检', '自动化'],
    llmPrompt: '当需要对大POI作业结果进行质检时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "batch_id": { "type": "string" },\n    "job_results": { "type": "array", "items": { "type": "object" } }\n  },\n  "required": ["batch_id", "job_results"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/poi/large-qa",\n    json={"batch_id": "B-001", "job_results": []},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
    isCore: true,
    version: 'v1.0.0',
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-01', author: 'QA Team', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'business_01',
    name: '电商选址分析 (E-commerce Site Selection)',
    toolName: 'ai-geoops_site_selection',
    category: '产线质检技能',
    scenarios: ['位置画像产线', 'POI产线'],
    type: 'SKILL',
    desc: '结合空间画像、竞品分布与交通便利度，为前置仓、实体店提供智能选址评分与选址建议。',
    tags: ['大模型', '自动化'],
    llmPrompt: '当用户需要开设新店、前置仓，需要评估候选位置的商业潜力和综合评分时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "candidates": {\n      "type": "array",\n      "items": { "type": "string" },\n      "description": "候选位置坐标列表"\n    },\n    "business_type": {\n      "type": "string",\n      "description": "业务类型，如：前置仓、咖啡店"\n    }\n  },\n  "required": ["candidates", "business_type"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/business/site-selection",\n    json={"candidates": ["39.9042,116.4074", "39.915,116.404"], "business_type": "前置仓"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <Hexagon className="w-6 h-6 text-purple-500" />,
    isCore: true,
    version: 'v2.0.0',
    versionHistory: [
      { version: 'v2.0.0', date: '2023-10-10', author: 'Business Team', changes: ['引入了机器学习模型进行评分预测', '支持自定义选址权重'] },
      { version: 'v1.0.0', date: '2023-04-25', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'business_02',
    name: '无人配送路径规划 (Drone Delivery Planning)',
    toolName: 'ai-geoops_drone_routing',
    category: '产线质检技能',
    scenarios: ['道路产线', 'AOI/楼栋产线'],
    type: 'SKILL',
    desc: '专为无人机/无人车设计的 3D 空间路径规划，规避禁飞区、高层建筑与复杂地形。',
    tags: ['空间计算', '自动化'],
    llmPrompt: '当需要为低空飞行器或无人配送车规划安全、合规的 3D 配送路线时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "origin": { "type": "string" },\n    "destination": { "type": "string" },\n    "altitude": { "type": "number", "description": "飞行高度（米）" }\n  },\n  "required": ["origin", "destination"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/business/drone-routing",\n    json={"origin": "39.9042,116.4074", "destination": "39.915,116.404", "altitude": 120},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <CloudLightning className="w-6 h-6 text-sky-500" />,
    isCore: true,
    version: 'v1.1.0',
    versionHistory: [
      { version: 'v1.1.0', date: '2023-09-05', author: 'Routing Team', changes: ['更新了全国禁飞区数据', '优化了 3D 避障算法'] },
      { version: 'v1.0.0', date: '2023-05-20', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  },
  {
    id: 'business_03',
    name: '城市管理空间分析 (Urban Spatial Decision)',
    toolName: 'ai-geoops_urban_analysis',
    category: '产线质检技能',
    scenarios: ['AOI/楼栋产线', '位置画像产线'],
    type: 'MCP',
    desc: '针对城市网格化管理、公共设施覆盖率、应急响应范围进行宏观空间决策分析。',
    tags: ['空间计算', '数据处理'],
    llmPrompt: '当政府或城管部门需要评估公共设施覆盖度、应急响应时间或进行网格化分析时调用。',
    schema: '{\n  "type": "object",\n  "properties": {\n    "region": { "type": "string", "description": "分析区域边界 (GeoJSON)" },\n    "analysis_type": { "type": "string", "enum": ["coverage", "emergency", "grid"] }\n  },\n  "required": ["region", "analysis_type"]\n}',
    codeSnippet: `import requests\n\nresponse = requests.post(\n    "https://api.ai-geoops.com/v1/business/urban-analysis",\n    json={"region": "POLYGON((...))", "analysis_type": "coverage"},\n    headers={"Authorization": "Bearer YOUR_API_KEY"}\n)\nprint(response.json())`,
    icon: <Globe2 className="w-6 h-6 text-teal-500" />,
    isCore: true,
    version: 'v1.3.0',
    versionHistory: [
      { version: 'v1.3.0', date: '2023-11-08', author: 'Urban Team', changes: ['新增了应急响应范围的动态模拟', '支持导入自定义设施数据'] },
      { version: 'v1.0.0', date: '2023-06-01', author: 'System Admin', changes: ['初始版本发布'] }
    ]
  }
];

const MAIN_TABS = [
  { id: 'ALL', name: '全部' },
  { id: 'SKILL', name: 'Skills', badge: '核心' },
  { id: 'MCP', name: 'MCP (Model Context Protocol)' },
  { id: 'API', name: 'API' }
];

export default function SkillStore() {
  const { skillCategories, scenarios, skillTags } = useDictionary();
  const SCENARIOS = ['全部场景', ...scenarios];

  const [activeMainTab, setActiveMainTab] = useState('ALL');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [installedSkills, setInstalledSkills] = useState<string[]>(['atomic_01', 'composite_01', 'business_01']);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [versionModal, setVersionModal] = useState<{isOpen: boolean, data: any | null}>({ isOpen: false, data: null });
  
  // Custom Skill Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customType, setCustomType] = useState<'skill' | 'mcp' | 'api'>('skill');
  const [customForm, setCustomForm] = useState({ 
    name: '', 
    toolName: '', 
    category: skillCategories[0] || '自定义',
    scenario: scenarios[0] || '通用基础',
    desc: '', 
    detailedDesc: '',
    tags: [] as string[],
    llmPrompt: '',
    schema: '{\n  "type": "object",\n  "properties": {}\n}',
    outputDesc: '',
    code: 'def execute(params):\n    # Your python code here\n    return {"status": "success"}',
    endpoint: '',
    method: 'GET',
    authType: 'none',
    headers: '{\n  "Content-Type": "application/json"\n}',
    runtime: 'python3.9'
  });
  const [activeTab, setActiveTab] = useState<'info' | 'versions' | 'playground'>('info');
  const [testParams, setTestParams] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit & Version Management State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', scenario: '', desc: '', detailedDesc: '', tags: [] as string[] });
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [selectedTestVersion, setSelectedTestVersion] = useState('');
  
  const [builtInSkills, setBuiltInSkills] = useState(SKILLS);
  const [customSkills, setCustomSkills] = useState<any[]>([]);

  const toggleScenario = (scenario: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenario) ? prev.filter(s => s !== scenario) : [...prev, scenario]
    );
  };

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev => 
      prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleInstall = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (installedSkills.includes(id)) {
      setInstalledSkills(installedSkills.filter(skillId => skillId !== id));
    } else {
      setInstalledSkills([...installedSkills, id]);
    }
  };

  const handleCreateCustom = () => {
    if (!customForm.name) return;
    if (customType === 'api' && !customForm.toolName) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newSkill = {
        id: `custom_${Date.now()}`,
        name: customForm.name,
        toolName: customType === 'mcp' ? `mcp_server_${Date.now()}` : customType === 'skill' ? `skill_${Date.now()}` : customForm.toolName,
        category: customType === 'skill' ? customForm.category : customType === 'mcp' ? 'MCP' : customForm.category,
        scenario: customForm.scenario,
        type: customType === 'skill' ? 'SKILL' : customType === 'mcp' ? 'MCP' : 'API',
        desc: customType === 'mcp' ? 'MCP Server connection' : customForm.desc,
        detailedDesc: customForm.detailedDesc,
        tags: customForm.tags,
        llmPrompt: customType === 'mcp' ? 'Provides dynamic tools via MCP.' : customForm.llmPrompt,
        schema: customType === 'mcp' ? '{}' : customForm.schema,
        codeSnippet: customType === 'skill' ? customForm.code : customType === 'mcp' ? `MCP Server: ${customForm.endpoint}` : `import requests\n\nresponse = requests.${customForm.method.toLowerCase()}("${customForm.endpoint}", headers=${customForm.headers})\nprint(response.json())`,
        icon: customType === 'skill' ? <Code2 className="w-6 h-6 text-indigo-500" /> : customType === 'mcp' ? <Database className="w-6 h-6 text-purple-500" /> : <Webhook className="w-6 h-6 text-amber-500" />,
        isCustom: true,
        version: 'v1.0.0',
        versionHistory: [
          { version: 'v1.0.0', date: new Date().toISOString().split('T')[0], author: 'Current User', changes: ['初始版本发布'] }
        ]
      };
      setCustomSkills([...customSkills, newSkill]);
      setInstalledSkills([...installedSkills, newSkill.id]);
      
      // Reset form
      setCustomForm({ 
        name: '', toolName: '', category: skillCategories[0] || '自定义', scenario: scenarios[0] || '通用基础', desc: '', detailedDesc: '', tags: [], llmPrompt: '', 
        schema: '{\n  "type": "object",\n  "properties": {}\n}', outputDesc: '',
        code: 'def execute(params):\n    # Your python code here\n    return {"status": "success"}',
        endpoint: '', method: 'GET', authType: 'none', headers: '{\n  "Content-Type": "application/json"\n}', runtime: 'python3.9'
      });
      setIsCustomModalOpen(false);
    }, 800);
  };

  const openSkillDetails = (skill: any) => {
    setSelectedSkill(skill);
    setEditForm({
      name: skill.name,
      category: skill.category,
      scenario: skill.scenarios?.join(', ') || skill.scenario || '',
      desc: skill.desc,
      detailedDesc: skill.detailedDesc || '',
      tags: skill.tags || []
    });
    setSelectedTestVersion(skill.versionHistory?.[0]?.version || skill.version || 'v1.0.0');
    setActiveTab('info');
    setIsEditingInfo(false);
    setTestParams('');
    setTestResult('');
  };

  const handleSaveInfo = () => {
    const updatedSkill = {
      ...selectedSkill,
      name: editForm.name,
      category: editForm.category,
      scenario: editForm.scenario,
      scenarios: editForm.scenario.split(',').map((s: string) => s.trim()),
      desc: editForm.desc,
      detailedDesc: editForm.detailedDesc,
      tags: editForm.tags
    };
    
    setSelectedSkill(updatedSkill);
    
    if (updatedSkill.isCustom) {
      setCustomSkills(prev => prev.map(s => s.id === updatedSkill.id ? updatedSkill : s));
    } else {
      setBuiltInSkills(prev => prev.map(s => s.id === updatedSkill.id ? updatedSkill : s));
    }
    
    setIsEditingInfo(false);
  };

  const handleUploadVersion = () => {
    if (!newVersionDesc) return;
    setIsUploadingVersion(true);
    setTimeout(() => {
      setIsUploadingVersion(false);
      
      const currentVersion = selectedSkill.versionHistory?.[0]?.version || 'v1.0.0';
      const parts = currentVersion.replace('v', '').split('.');
      const newVersionNum = `v${parts[0]}.${parseInt(parts[1] || '0') + 1}.0`;
      
      const newHistoryItem = {
        version: newVersionNum,
        date: new Date().toISOString().split('T')[0],
        author: 'Current User',
        changes: newVersionDesc.split('\n').filter(line => line.trim())
      };
      
      const updatedSkill = {
        ...selectedSkill,
        version: newVersionNum,
        versionHistory: [newHistoryItem, ...(selectedSkill.versionHistory || [])]
      };
      
      setSelectedSkill(updatedSkill);
      setNewVersionDesc('');
      
      if (updatedSkill.isCustom) {
        setCustomSkills(prev => prev.map(s => s.id === updatedSkill.id ? updatedSkill : s));
      } else {
        setBuiltInSkills(prev => prev.map(s => s.id === updatedSkill.id ? updatedSkill : s));
      }
    }, 800);
  };

  const handleTestTool = () => {
    setIsTesting(true);
    setTestResult('');
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(JSON.stringify({
        status: 'success',
        version_used: selectedTestVersion,
        message: 'Tool executed successfully (Mocked)',
        data: { result: 'Sample output based on ' + testParams }
      }, null, 2));
    }, 1000);
  };

  const allSkills = [...builtInSkills, ...customSkills];
  const filteredSkills = allSkills.filter(skill => {
    const matchesTab = activeMainTab === 'ALL' || skill.type === activeMainTab;
    
    const matchesScenario = selectedScenarios.length === 0 || 
      (skill.scenarios && skill.scenarios.some((s: string) => selectedScenarios.includes(s)));
      
    const isCustomSkill = skill.isCustom || false;
    const matchesProvider = selectedProviders.length === 0 || 
      (selectedProviders.includes('官方提供') && !isCustomSkill) ||
      (selectedProviders.includes('自定义') && isCustomSkill);

    const matchesTags = selectedTags.length === 0 || 
      (skill.tags && selectedTags.every(t => skill.tags.includes(t)));

    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.toolName.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesTab && matchesScenario && matchesProvider && matchesTags && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header and Tabs */}
      <div className="px-8 pt-8 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-red-500" />
                产线Skills管理 (Production Line Skills)
              </h1>
              <p className="text-slate-500 mt-1">管理产线Agent可调用的专属技能、API与代码片段（Function Calling）。</p>
            </div>
            <button 
              onClick={() => setIsCustomModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              注册新工具
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
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeMainTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex w-full">
        {/* Left Sidebar Filters */}
        <div className="w-64 shrink-0 p-6 border-r border-slate-200 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-slate-800 mb-6">技能筛选</h2>
          
          {/* Scenarios Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">业务场景</h3>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(scenario => (
                <button
                  key={scenario}
                  onClick={() => toggleScenario(scenario)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedScenarios.includes(scenario)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                  }`}
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">提供方</h3>
            <div className="flex flex-wrap gap-2">
              {['官方提供', '自定义'].map(provider => (
                <button
                  key={provider}
                  onClick={() => toggleProvider(provider)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedProviders.includes(provider)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">技能标签</h3>
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
              共 <span className="font-bold text-slate-800">{filteredSkills.length}</span> 个技能
            </div>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="输入技能名称/标识搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSkills.map(skill => {
            const isInstalled = installedSkills.includes(skill.id);
            
            let typeStyle = {
              bg: 'bg-white', border: 'border-slate-200 hover:border-slate-300',
              typeBadge: 'bg-slate-100 text-slate-600 border-slate-200',
              iconBg: 'bg-slate-50', glow: 'hidden', toolName: 'bg-slate-50 text-slate-500'
            };
            if (skill.type === 'SKILL') {
              typeStyle = {
                bg: 'bg-gradient-to-b from-white to-blue-50/30', border: 'border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10',
                typeBadge: 'bg-blue-100 text-blue-700 border-blue-200', iconBg: 'bg-blue-50 border border-blue-100',
                glow: 'bg-blue-500/5 group-hover:bg-blue-500/10', toolName: 'bg-blue-50 text-blue-600 border-blue-100/50'
              };
            } else if (skill.type === 'MCP') {
              typeStyle = {
                bg: 'bg-gradient-to-b from-white to-purple-50/30', border: 'border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10',
                typeBadge: 'bg-purple-100 text-purple-700 border-purple-200', iconBg: 'bg-purple-50 border border-purple-100',
                glow: 'bg-purple-500/5 group-hover:bg-purple-500/10', toolName: 'bg-purple-50 text-purple-600 border-purple-100/50'
              };
            } else if (skill.type === 'API') {
              typeStyle = {
                bg: 'bg-gradient-to-b from-white to-amber-50/30', border: 'border-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10',
                typeBadge: 'bg-amber-100 text-amber-700 border-amber-200', iconBg: 'bg-amber-50 border border-amber-100',
                glow: 'bg-amber-500/5 group-hover:bg-amber-500/10', toolName: 'bg-amber-50 text-amber-600 border-amber-100/50'
              };
            }

            return (
              <div 
                key={skill.id} 
                onClick={() => openSkillDetails(skill)}
                className={`p-5 rounded-2xl border transition-all group cursor-pointer flex flex-col h-full relative overflow-hidden ${typeStyle.bg} ${typeStyle.border}`}
              >
                {isInstalled && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                    已启用
                  </div>
                )}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-colors ${typeStyle.glow}`}></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${typeStyle.iconBg}`}>
                    {skill.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1 mt-1">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {skill.scenarios && skill.scenarios.map((s: string) => (
                        <span key={s} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                      {skill.isCore ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {skill.category}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {skill.category}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeStyle.typeBadge}`}>
                      {skill.type}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-1 relative z-10">{skill.name}</h3>
                <p className={`text-xs font-mono mb-3 p-1.5 rounded inline-block w-fit relative z-10 border ${typeStyle.toolName}`}>
                  {skill.toolName}
                </p>
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 relative z-10">
                    {skill.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {skill.tags.length > 3 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        +{skill.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-slate-500 leading-relaxed mb-4 h-10 line-clamp-2 flex-1 relative z-10">{skill.desc}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {skill.version || 'v1.0.0'}
                    </span>
                    {skill.version && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setVersionModal({ isOpen: true, data: skill }); }}
                        className="text-[10px] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <History className="w-3 h-3" />
                        历史
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleToggleInstall(skill.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isInstalled 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    {isInstalled ? '停用工具' : '启用工具'}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Skill Details Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setSelectedSkill(null)}>
          <div className="bg-white shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                  {selectedSkill.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedSkill.name}
                    {installedSkills.includes(selectedSkill.id) && (
                      <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                    )}
                  </h2>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1.5 font-mono text-xs">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{selectedSkill.toolName}</span>
                    <span className="flex items-center gap-1"><Database className="w-3 h-3"/> v1.0.0</span>
                    <span>Provider: {selectedSkill.isCustom ? 'Workspace' : (selectedSkill.isCore ? 'AI-GeoOps AI' : 'AI-GeoOps Core')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-white">
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
                技能试用
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50/30">
              {activeTab === 'info' ? (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <TerminalSquare className="w-4 h-4 text-slate-400" />
                      技能说明
                    </h3>
                    {!isEditingInfo ? (
                      <button onClick={() => setIsEditingInfo(true)} className="text-sm text-blue-500 hover:text-blue-600">编辑</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditingInfo(false)} className="text-sm text-slate-500 hover:text-slate-600">取消</button>
                        <button onClick={handleSaveInfo} className="text-sm text-blue-500 hover:text-blue-600 font-medium">保存</button>
                      </div>
                    )}
                  </div>
                  
                  {isEditingInfo ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">工具名称</label>
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">技能简介</label>
                        <textarea value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg h-16 resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">技能详细说明 (具体能力)</label>
                        <textarea value={editForm.detailedDesc} onChange={e => setEditForm({...editForm, detailedDesc: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="详细描述该技能的具体功能、支持的类型等..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">所属分类</label>
                          <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            {skillCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">应用场景</label>
                          <input value={editForm.scenario} onChange={e => setEditForm({...editForm, scenario: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="多个场景用逗号分隔" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">技能标签</label>
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
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-2">技能简介</h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          {selectedSkill.desc}
                        </p>
                      </div>
                      
                      {selectedSkill.detailedDesc && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 mb-2">技能详细说明 (具体能力)</h4>
                          <div className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap">
                            {selectedSkill.detailedDesc}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 mb-1">所属分类</h4>
                          <div className="text-sm font-medium text-slate-800">{selectedSkill.category}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 mb-1">应用场景</h4>
                          <div className="text-sm font-medium text-slate-800">
                            {selectedSkill.scenarios?.join(', ') || selectedSkill.scenario || '通用'}
                          </div>
                        </div>
                      </div>

                      {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 mb-2">技能标签</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSkill.tags.map((tag: string) => (
                              <span key={tag} className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                          <p className="text-xs text-slate-500">点击上传新版本 Skill 包</p>
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
                    {selectedSkill.versionHistory?.map((v: any, idx: number) => (
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
                          下载包
                        </button>
                      </div>
                    ))}
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
                      {selectedSkill.versionHistory?.map((v: any) => (
                        <option key={v.version} value={v.version}>{v.version}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col min-h-[150px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">输入测试文本</h3>
                    <textarea 
                      value={testParams}
                      onChange={(e) => setTestParams(e.target.value)}
                      className="flex-1 w-full p-4 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none shadow-sm"
                      placeholder="例如：帮我查询一下北京海淀区上地十街10号的坐标..."
                    />
                    <button 
                      onClick={handleTestTool}
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
                    <h3 className="text-sm font-bold text-slate-800 mb-2">召回结果</h3>
                    <div className="flex-1 w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 overflow-auto shadow-inner">
                      {testResult ? (
                        <pre className="whitespace-pre-wrap break-words"><code>{testResult}</code></pre>
                      ) : (
                        <span className="text-slate-600">等待输入文本并执行...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end items-center">
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedSkill(null)} 
                  className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
                >
                  关闭
                </button>
                <button 
                  onClick={() => handleToggleInstall(selectedSkill.id)}
                  className={`px-5 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-2 shadow-sm ${
                    installedSkills.includes(selectedSkill.id)
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {installedSkills.includes(selectedSkill.id) ? '停用此工具' : '启用此工具'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Skill Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setIsCustomModalOpen(false)}>
          <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">注册新工具 (Tool Registry)</h2>
                <p className="text-xs text-slate-500 mt-0.5">定义一个新的 Function Calling 工具供 Agent 使用</p>
              </div>
              <button onClick={() => setIsCustomModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 bg-white">
              <button 
                onClick={() => setCustomType('skill')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  customType === 'skill' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Skill 注册
              </button>
              <button 
                onClick={() => setCustomType('mcp')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  customType === 'mcp' ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Database className="w-4 h-4" />
                MCP 注册
              </button>
              <button 
                onClick={() => setCustomType('api')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  customType === 'api' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-50/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Webhook className="w-4 h-4" />
                API 注册
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {customType === 'mcp' ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 text-purple-700 p-4 rounded-xl text-sm border border-purple-100">
                    配置 MCP (Model Context Protocol) 服务器，系统将自动发现并注册该服务器提供的所有工具。
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-slate-500" />
                      MCP 服务器配置
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">服务器名称 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={customForm.name}
                          onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                          placeholder="例如: 内部知识库 MCP"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">传输协议 (Transport)</label>
                        <select 
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-sm bg-white"
                        >
                          <option value="sse">SSE (Server-Sent Events)</option>
                          <option value="stdio">Stdio (本地进程)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">服务器地址 (URL / Command) <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={customForm.endpoint}
                          onChange={(e) => setCustomForm({...customForm, endpoint: e.target.value})}
                          placeholder="例如: https://mcp.example.com/sse"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 text-sm font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Section 1: 基础信息 */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <Settings2 className="w-4 h-4 text-slate-500" />
                      基础信息 (Basic Info)
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">工具显示名称 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={customForm.name}
                          onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                          placeholder="例如: 企查查工商查询"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">工具标识 (Function Name) <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={customForm.toolName}
                          onChange={(e) => setCustomForm({...customForm, toolName: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')})}
                          placeholder="例如: query_company_info"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm font-mono bg-white"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">仅支持英文、数字和下划线，供 LLM 调用。</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">分类 (Category)</label>
                        <select 
                          value={customForm.category}
                          onChange={(e) => setCustomForm({...customForm, category: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                        >
                          {skillCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">应用场景 (Scenario)</label>
                        <select 
                          value={customForm.scenario}
                          onChange={(e) => setCustomForm({...customForm, scenario: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                        >
                          {scenarios.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">工具描述 (Description)</label>
                        <input 
                          type="text" 
                          value={customForm.desc}
                          onChange={(e) => setCustomForm({...customForm, desc: e.target.value})}
                          placeholder="简短描述该工具的功能"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">技能详细说明</label>
                        <textarea 
                          value={customForm.detailedDesc} 
                          onChange={e => setCustomForm({...customForm, detailedDesc: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white h-24 resize-none"
                          placeholder="详细描述该技能的具体功能、支持的类型等..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">技能标签</label>
                        <div className="flex flex-wrap gap-2">
                          {skillTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                setCustomForm(prev => ({
                                  ...prev,
                                  tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                customForm.tags.includes(tag)
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
                  </div>

                  {/* Section 2: 大模型调用配置 */}
                  <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 space-y-4">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-500" />
                      大模型调用配置 (LLM Config)
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">提示词 (LLM Instruction) <span className="text-red-500">*</span></label>
                      <textarea 
                        value={customForm.llmPrompt}
                        onChange={(e) => setCustomForm({...customForm, llmPrompt: e.target.value})}
                        placeholder="告诉大模型在什么情况下应该调用这个工具。例如：当用户询问某家公司的法人、注册资本等工商信息时调用此工具。"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm resize-none h-20 bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between items-center">
                          <span>输入参数 (Input Schema)</span>
                          <button className="text-xs text-indigo-500 font-normal hover:underline">自动生成</button>
                        </label>
                        <textarea 
                          value={customForm.schema}
                          onChange={(e) => setCustomForm({...customForm, schema: e.target.value})}
                          className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-xs font-mono bg-white h-32"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">输出格式 (Output Description)</label>
                        <textarea 
                          value={customForm.outputDesc}
                          onChange={(e) => setCustomForm({...customForm, outputDesc: e.target.value})}
                          placeholder="描述工具返回的数据结构，帮助大模型更好地解析结果。例如：返回包含经纬度 (lat, lng) 和格式化地址的 JSON 对象。"
                          className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm bg-white h-32 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: 执行配置 */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <TerminalSquare className="w-4 h-4 text-slate-500" />
                      执行配置 (Execution Config)
                    </h3>
                    
                    {customType === 'api' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">请求方法 (Method)</label>
                            <select 
                              value={customForm.method}
                              onChange={(e) => setCustomForm({...customForm, method: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 text-sm bg-white font-mono"
                            >
                              <option>GET</option>
                              <option>POST</option>
                              <option>PUT</option>
                              <option>DELETE</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">请求地址 (Endpoint)</label>
                            <input 
                              type="text" 
                              value={customForm.endpoint}
                              onChange={(e) => setCustomForm({...customForm, endpoint: e.target.value})}
                              placeholder="https://api.example.com/v1/resource"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 text-sm font-mono bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">鉴权方式 (Authentication)</label>
                            <select 
                              value={customForm.authType}
                              onChange={(e) => setCustomForm({...customForm, authType: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 text-sm bg-white"
                            >
                              <option value="none">无 (None)</option>
                              <option value="bearer">Bearer Token</option>
                              <option value="apikey">API Key (Header)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">自定义请求头 (Headers JSON)</label>
                            <textarea 
                              value={customForm.headers}
                              onChange={(e) => setCustomForm({...customForm, headers: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 text-xs font-mono bg-white h-16 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {customType === 'skill' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <Settings2 className="w-4 h-4 text-slate-500" />
                            Skill 包注册
                          </h3>
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">工具名称 <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                value={customForm.name}
                                onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                                placeholder="例如: 企查查工商查询"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">分类</label>
                                <select 
                                  value={customForm.category}
                                  onChange={(e) => setCustomForm({...customForm, category: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white"
                                >
                                  {skillCategories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">分类标签</label>
                                <select 
                                  value={customForm.scenario}
                                  onChange={(e) => setCustomForm({...customForm, scenario: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white"
                                >
                                  {scenarios.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Skills 说明</label>
                              <textarea 
                                value={customForm.desc}
                                onChange={(e) => setCustomForm({...customForm, desc: e.target.value})}
                                placeholder="简短描述该工具的功能"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white resize-none h-20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">Skills 包上传 <span className="text-red-500">*</span></label>
                              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer bg-white">
                                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-700">点击或拖拽 .zip / .tar.gz 文件到此处</p>
                                <p className="text-xs text-slate-400 mt-1">支持最大 50MB 的压缩包</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setIsCustomModalOpen(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleCreateCustom}
                disabled={isUploading || !customForm.name || (customType === 'api' && !customForm.toolName)}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存工具'
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
