import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, ChevronDown, FileText, Folder, Clock, User, Plus, Pencil, Save, X, History, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
};

const highlightNodeText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark> : part
  );
};

const processChildren = (children: React.ReactNode, query: string): React.ReactNode => {
  if (!query.trim()) return children;
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return highlightNodeText(child, query);
    }
    if (React.isValidElement(child) && (child.props as any).children) {
      return React.cloneElement(child as React.ReactElement<any>, {
        children: processChildren((child.props as any).children, query)
      });
    }
    return child;
  });
};

// Mock hierarchical data
const initialWikiData = [
  {
    id: 'cat1',
    name: '安全规范',
    children: [
      { 
        id: 'doc1', 
        name: '产线安全操作规范', 
        content: '# 产线安全操作规范\n\n## 1. 目的\n规范产线人员操作，保障生产安全。\n\n## 2. 适用范围\n适用于所有产线工作人员。\n\n## 3. 安全要求\n- 必须穿戴劳保用品\n- 严禁违规操作机器\n- 发现隐患及时上报\n\n## 4. 处罚规定\n对于违反安全操作规范的行为，将视情节轻重给予警告、罚款或辞退处理。', 
        author: '安全组', 
        date: '2024-03-15',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-03-15', author: '安全组', content: '# 产线安全操作规范\n\n## 1. 目的\n规范产线人员操作，保障生产安全。\n\n## 2. 适用范围\n适用于所有产线工作人员。\n\n## 3. 安全要求\n- 必须穿戴劳保用品\n- 严禁违规操作机器\n- 发现隐患及时上报\n\n## 4. 处罚规定\n对于违反安全操作规范的行为，将视情节轻重给予警告、罚款或辞退处理。', note: '初始版本' }
        ]
      },
      { 
        id: 'doc2', 
        name: '应急处理流程', 
        content: '# 应急处理流程\n\n## 火灾应急\n1. 立即按下火灾报警按钮。\n2. 使用就近的灭火器进行初期扑救。\n3. 按照疏散路线撤离。\n\n## 触电应急\n1. 立即切断电源。\n2. 使用绝缘物体使触电者脱离电源。\n3. 拨打120急救电话。', 
        author: '安全组', 
        date: '2024-03-16',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-03-16', author: '安全组', content: '# 应急处理流程\n\n## 火灾应急\n1. 立即按下火灾报警按钮。\n2. 使用就近的灭火器进行初期扑救。\n3. 按照疏散路线撤离。\n\n## 触电应急\n1. 立即切断电源。\n2. 使用绝缘物体使触电者脱离电源。\n3. 拨打120急救电话。', note: '初始版本' }
        ]
      },
      {
        id: 'doc_safe_3',
        name: '危险化学品处理指南',
        content: '# 危险化学品处理指南\n\n## 1. 存储要求\n- 分类存放，严禁混放。\n- 保持通风良好。\n- 设置明显的警示标志。\n\n## 2. 泄漏处理\n- 立即疏散人员。\n- 穿戴防护服和防毒面具。\n- 使用沙土或专用吸附剂进行覆盖和清理。',
        author: '安全组',
        date: '2024-04-01',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-04-01', author: '安全组', content: '# 危险化学品处理指南\n\n## 1. 存储要求\n- 分类存放，严禁混放。\n- 保持通风良好。\n- 设置明显的警示标志。\n\n## 2. 泄漏处理\n- 立即疏散人员。\n- 穿戴防护服和防毒面具。\n- 使用沙土或专用吸附剂进行覆盖和清理。', note: '初始版本' }
        ]
      }
    ]
  },
  {
    id: 'cat2',
    name: '技术指南',
    children: [
      { 
        id: 'doc3', 
        name: 'POI数据清洗指南', 
        content: '# POI数据清洗指南\n\n## 1. 数据去重\n根据 `poi_id` 和 `location` 进行精确去重。\n\n## 2. 异常值处理\n- 剔除经纬度超出中国范围的数据。\n- 修复名称中包含特殊字符的记录。\n\n## 3. 格式标准化\n统一将电话号码格式化为 `xxx-xxxxxxxx`。', 
        author: '技术部', 
        date: '2024-03-10',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-03-10', author: '技术部', content: '# POI数据清洗指南\n\n## 1. 数据去重\n根据 `poi_id` 和 `location` 进行精确去重。\n\n## 2. 异常值处理\n- 剔除经纬度超出中国范围的数据。\n- 修复名称中包含特殊字符的记录。\n\n## 3. 格式标准化\n统一将电话号码格式化为 `xxx-xxxxxxxx`。', note: '初始版本' }
        ]
      },
      { 
        id: 'doc4', 
        name: 'Agent编排最佳实践', 
        content: '# Agent编排最佳实践\n\n## 1. 模块化设计\n将复杂的任务拆分为多个单一职责的 Agent。\n\n## 2. 状态管理\n使用共享内存或外部数据库来维护 Agent 之间的状态。\n\n## 3. 错误恢复\n为每个关键节点配置重试机制和降级策略。', 
        author: '技术部', 
        date: '2024-03-12',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-03-12', author: '技术部', content: '# Agent编排最佳实践\n\n## 1. 模块化设计\n将复杂的任务拆分为多个单一职责的 Agent。\n\n## 2. 状态管理\n使用共享内存或外部数据库来维护 Agent 之间的状态。\n\n## 3. 错误恢复\n为每个关键节点配置重试机制和降级策略。', note: '初始版本' }
        ]
      },
      {
        id: 'doc_tech_3',
        name: 'LLM提示词工程规范',
        content: '# LLM提示词工程规范\n\n## 1. 背景\n为了提高产线Agent的生成质量和稳定性，特制定本提示词工程规范。\n\n## 2. 核心原则\n* **明确性 (Clarity)**: 指令必须清晰、无歧义。\n* **上下文 (Context)**: 提供充足的背景信息。\n* **约束 (Constraints)**: 明确输出格式、长度和语气。\n\n## 3. 模板示例\n```xml\n<role>你是一个资深的地理空间数据分析师。</role>\n<task>请分析以下POI数据，提取出所有的餐饮类店铺。</task>\n<format>请以JSON数组格式输出。</format>\n```\n\n## 4. 常见反面模式\n- 过于简短的指令（例如：“分析数据”）。\n- 包含互相矛盾的约束条件。',
        author: 'AI架构组',
        date: '2024-04-10',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-04-10', author: 'AI架构组', content: '# LLM提示词工程规范\n\n## 1. 背景\n为了提高产线Agent的生成质量和稳定性，特制定本提示词工程规范。\n\n## 2. 核心原则\n* **明确性 (Clarity)**: 指令必须清晰、无歧义。\n* **上下文 (Context)**: 提供充足的背景信息。\n* **约束 (Constraints)**: 明确输出格式、长度和语气。\n\n## 3. 模板示例\n```xml\n<role>你是一个资深的地理空间数据分析师。</role>\n<task>请分析以下POI数据，提取出所有的餐饮类店铺。</task>\n<format>请以JSON数组格式输出。</format>\n```\n\n## 4. 常见反面模式\n- 过于简短的指令（例如：“分析数据”）。\n- 包含互相矛盾的约束条件。', note: '初始版本' }
        ]
      },
      {
        id: 'doc_tech_4',
        name: '空间数据(GeoJSON)解析教程',
        content: '# 空间数据(GeoJSON)解析教程\n\n## 什么是 GeoJSON？\nGeoJSON 是一种基于 JSON 的地理空间数据交换格式。它定义了几种类型的 JSON 对象，以及它们组合起来表示有关地理特征、属性和空间范围的数据的方式。\n\n## 支持的几何类型\n- `Point` (点)\n- `LineString` (线)\n- `Polygon` (面)\n- `MultiPoint` (多点)\n- `MultiLineString` (多线)\n- `MultiPolygon` (多面)\n\n## 示例代码 (Python)\n```python\nimport json\nfrom shapely.geometry import shape\n\nwith open(\'data.geojson\') as f:\n    data = json.load(f)\n\nfor feature in data[\'features\']:\n    geom = shape(feature[\'geometry\'])\n    print(f"Area: {geom.area}")\n```',
        author: 'GIS开发组',
        date: '2024-04-12',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-04-12', author: 'GIS开发组', content: '# 空间数据(GeoJSON)解析教程\n\n## 什么是 GeoJSON？\nGeoJSON 是一种基于 JSON 的地理空间数据交换格式。它定义了几种类型的 JSON 对象，以及它们组合起来表示有关地理特征、属性和空间范围的数据的方式。\n\n## 支持的几何类型\n- `Point` (点)\n- `LineString` (线)\n- `Polygon` (面)\n- `MultiPoint` (多点)\n- `MultiLineString` (多线)\n- `MultiPolygon` (多面)\n\n## 示例代码 (Python)\n```python\nimport json\nfrom shapely.geometry import shape\n\nwith open(\'data.geojson\') as f:\n    data = json.load(f)\n\nfor feature in data[\'features\']:\n    geom = shape(feature[\'geometry\'])\n    print(f"Area: {geom.area}")\n```', note: '初始版本' }
        ]
      }
    ]
  },
  {
    id: 'cat3',
    name: '运维手册',
    children: [
      { 
        id: 'doc5', 
        name: '设备维护手册', 
        content: '# 设备维护手册\n\n## 1. 日常巡检\n- 检查服务器 CPU 和内存使用率。\n- 确认磁盘空间充足 (>20%)。\n\n## 2. 定期保养\n- 每月清理一次服务器灰尘。\n- 每季度进行一次数据备份恢复演练。', 
        author: '运维组', 
        date: '2024-02-28',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-02-28', author: '运维组', content: '# 设备维护手册\n\n## 1. 日常巡检\n- 检查服务器 CPU 和内存使用率。\n- 确认磁盘空间充足 (>20%)。\n\n## 2. 定期保养\n- 每月清理一次服务器灰尘。\n- 每季度进行一次数据备份恢复演练。', note: '初始版本' }
        ]
      },
      {
        id: 'doc_ops_2',
        name: '故障排查SOP',
        content: '# 故障排查标准作业程序 (SOP)\n\n## 1. 故障分级\n| 级别 | 描述 | 响应时间 |\n|---|---|---|\n| P0 | 核心产线停机，严重影响业务 | 5分钟内 |\n| P1 | 部分功能不可用，有替代方案 | 15分钟内 |\n| P2 | 非核心功能异常，不影响主流程 | 2小时内 |\n\n## 2. 排查步骤\n1. **确认现象**: 收集报警信息、日志和用户反馈。\n2. **隔离问题**: 判断是网络、数据库还是应用层问题。\n3. **恢复服务**: 优先考虑重启、降级或回滚。\n4. **根因分析**: 服务恢复后，进行详细的复盘分析 (RCA)。\n\n## 3. 常用排查命令\n```bash\n# 查看实时日志\ntail -f /var/log/app.log\n\n# 检查网络连通性\nping 10.0.0.1\n```',
        author: 'SRE团队',
        date: '2024-04-05',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-04-05', author: 'SRE团队', content: '# 故障排查标准作业程序 (SOP)\n\n## 1. 故障分级\n| 级别 | 描述 | 响应时间 |\n|---|---|---|\n| P0 | 核心产线停机，严重影响业务 | 5分钟内 |\n| P1 | 部分功能不可用，有替代方案 | 15分钟内 |\n| P2 | 非核心功能异常，不影响主流程 | 2小时内 |\n\n## 2. 排查步骤\n1. **确认现象**: 收集报警信息、日志和用户反馈。\n2. **隔离问题**: 判断是网络、数据库还是应用层问题。\n3. **恢复服务**: 优先考虑重启、降级或回滚。\n4. **根因分析**: 服务恢复后，进行详细的复盘分析 (RCA)。\n\n## 3. 常用排查命令\n```bash\n# 查看实时日志\ntail -f /var/log/app.log\n\n# 检查网络连通性\nping 10.0.0.1\n```', note: '初始版本' }
        ]
      }
    ]
  },
  {
    id: 'cat4',
    name: '业务流程',
    children: [
      {
        id: 'doc_biz_1',
        name: '订单履约标准流程',
        content: '# 订单履约标准流程\n\n## 1. 订单接收\n系统自动从上游平台拉取订单信息，并进行格式校验。\n\n## 2. 库存锁定\n根据订单商品明细，在WMS系统中锁定对应库存。\n\n## 3. 拣货打包\n- 仓库人员根据拣货单进行商品拣选。\n- 扫描商品条码进行复核。\n- 打印面单并打包。\n\n## 4. 物流交接\n将打包好的包裹交接给合作物流商，并回传物流单号。',
        author: '业务运营组',
        date: '2024-04-08',
        versionHistory: [
          { id: 'v1', version: 'v1.0.0', date: '2024-04-08', author: '业务运营组', content: '# 订单履约标准流程\n\n## 1. 订单接收\n系统自动从上游平台拉取订单信息，并进行格式校验。\n\n## 2. 库存锁定\n根据订单商品明细，在WMS系统中锁定对应库存。\n\n## 3. 拣货打包\n- 仓库人员根据拣货单进行商品拣选。\n- 扫描商品条码进行复核。\n- 打印面单并打包。\n\n## 4. 物流交接\n将打包好的包裹交接给合作物流商，并回传物流单号。', note: '初始版本' }
        ]
      }
    ]
  }
];

export default function WikiManagement() {
  const [wikiData, setWikiData] = useState(initialWikiData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(initialWikiData[0].children[0]);
  const [expandedCats, setExpandedCats] = useState<string[]>(['cat1', 'cat2', 'cat3', 'cat4']);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', content: '', author: '', date: '', note: '', categoryId: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<any>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const startEdit = () => {
    const cat = wikiData.find(c => c.children.some(d => d.id === selectedDoc.id));
    setEditForm({ 
      name: selectedDoc.name, 
      content: selectedDoc.content, 
      author: selectedDoc.author, 
      date: selectedDoc.date, 
      note: '',
      categoryId: cat?.id || wikiData[0].id
    });
    setIsEditing(true);
  };

  const handleNewDoc = () => {
    const defaultCatId = wikiData[0].id;
    const newDoc = { 
      id: 'new', 
      name: '新建文档', 
      content: '# 新建文档\n\n请在此输入内容...', 
      author: '当前用户', 
      date: new Date().toISOString().split('T')[0], 
      versionHistory: [] 
    };
    setSelectedDoc(newDoc);
    setEditForm({ 
      name: newDoc.name, 
      content: newDoc.content, 
      author: newDoc.author, 
      date: newDoc.date, 
      note: '初始版本', 
      categoryId: defaultCatId 
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const newVersionId = Date.now().toString();
    const currentHistory = selectedDoc.id === 'new' ? [] : (selectedDoc.versionHistory || []);
    const newVersionNum = `v1.0.${currentHistory.length}`;
    
    const newVersion = {
      id: newVersionId,
      version: newVersionNum,
      date: editForm.date || new Date().toISOString().split('T')[0],
      author: editForm.author,
      content: editForm.content,
      note: editForm.note || (selectedDoc.id === 'new' ? '初始版本' : '更新文档')
    };

    const updatedDoc = { 
      ...selectedDoc, 
      id: selectedDoc.id === 'new' ? `doc_${Date.now()}` : selectedDoc.id,
      name: editForm.name,
      author: editForm.author,
      date: editForm.date,
      content: editForm.content,
      versionHistory: [newVersion, ...currentHistory]
    };

    setWikiData(prev => {
      // First, remove the doc from its old category if it existed
      let newData = prev.map(cat => ({
        ...cat,
        children: cat.children.filter(doc => doc.id !== selectedDoc.id)
      }));
      
      // Then, add the updated/new doc to the selected category
      newData = newData.map(cat => {
        if (cat.id === editForm.categoryId) {
          return {
            ...cat,
            children: [...cat.children, updatedDoc]
          };
        }
        return cat;
      });
      return newData;
    });
    
    setSelectedDoc(updatedDoc);
    setIsEditing(false);
  };

  const handleRollback = (version: any) => {
    const newVersionId = Date.now().toString();
    const currentHistory = selectedDoc.versionHistory || [];
    const newVersionNum = `v1.0.${currentHistory.length}`;
    
    const newVersion = {
      id: newVersionId,
      version: newVersionNum,
      date: new Date().toISOString().split('T')[0],
      author: 'Current User',
      content: version.content,
      note: `回滚至版本 ${version.version}`
    };

    const updatedDoc = { 
      ...selectedDoc, 
      content: version.content,
      versionHistory: [newVersion, ...currentHistory]
    };

    setWikiData(prev => prev.map(cat => ({
      ...cat,
      children: cat.children.map(doc => doc.id === selectedDoc.id ? updatedDoc : doc)
    })));
    setSelectedDoc(updatedDoc);
    setShowHistory(false);
    setPreviewVersion(null);
  };

  const filteredData = wikiData.map(cat => ({
    ...cat,
    children: cat.children.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.children.length > 0 || cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const markdownComponents = {
    p: ({node, children, ...props}: any) => <p {...props}>{processChildren(children, searchQuery)}</p>,
    h1: ({node, children, ...props}: any) => <h1 {...props}>{processChildren(children, searchQuery)}</h1>,
    h2: ({node, children, ...props}: any) => <h2 {...props}>{processChildren(children, searchQuery)}</h2>,
    h3: ({node, children, ...props}: any) => <h3 {...props}>{processChildren(children, searchQuery)}</h3>,
    h4: ({node, children, ...props}: any) => <h4 {...props}>{processChildren(children, searchQuery)}</h4>,
    h5: ({node, children, ...props}: any) => <h5 {...props}>{processChildren(children, searchQuery)}</h5>,
    h6: ({node, children, ...props}: any) => <h6 {...props}>{processChildren(children, searchQuery)}</h6>,
    li: ({node, children, ...props}: any) => <li {...props}>{processChildren(children, searchQuery)}</li>,
    td: ({node, children, ...props}: any) => <td {...props}>{processChildren(children, searchQuery)}</td>,
    th: ({node, children, ...props}: any) => <th {...props}>{processChildren(children, searchQuery)}</th>,
    blockquote: ({node, children, ...props}: any) => <blockquote {...props}>{processChildren(children, searchQuery)}</blockquote>,
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-red-500" />
              产线Wiki管理 (Knowledge Base)
            </h1>
            <p className="text-slate-500 mt-1">管理产线知识库，沉淀技术文档与操作规范。</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setShowHistory(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <History className="w-5 h-5" />
                  版本历史
                </button>
                <button onClick={startEdit} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <Pencil className="w-5 h-5" />
                  编辑文档
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <X className="w-5 h-5" />
                  取消
                </button>
                <button onClick={handleSave} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <Save className="w-5 h-5" />
                  保存
                </button>
              </>
            )}
            <button onClick={handleNewDoc} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-5 h-5" />
              新建文档
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex w-full">
        {/* Sidebar - Directory Tree */}
        <div className="w-72 shrink-0 border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredData.map(cat => (
              <div key={cat.id}>
                <button 
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {expandedCats.includes(cat.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <Folder className="w-4 h-4 text-indigo-500" />
                  {cat.name}
                </button>
                {expandedCats.includes(cat.id) && (
                  <div className="pl-6 mt-1 space-y-1">
                    {cat.children.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDoc(doc); setIsEditing(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-colors ${
                          selectedDoc.id === doc.id ? 'bg-red-50 text-red-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <HighlightText text={doc.name} highlight={searchQuery} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className={isEditing ? "max-w-6xl h-full flex flex-col" : "max-w-4xl"}>
            {isEditing ? (
              <div className="space-y-4 flex flex-col h-full">
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  className="text-3xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-red-500 focus:outline-none px-0 py-1 w-full" 
                  placeholder="文档标题" 
                />
                <div className="flex items-center gap-4">
                  <select 
                    value={editForm.categoryId} 
                    onChange={e => setEditForm({...editForm, categoryId: e.target.value})}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                  >
                    {wikiData.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" placeholder="作者" />
                  <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-6 flex-1 min-h-[500px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Markdown 编辑
                      </label>
                      <input 
                        value={editForm.note} 
                        onChange={e => setEditForm({...editForm, note: e.target.value})} 
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 w-48" 
                        placeholder="版本更新说明 (可选)" 
                      />
                    </div>
                    <textarea 
                      value={editForm.content} 
                      onChange={e => setEditForm({...editForm, content: e.target.value})} 
                      className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none font-mono text-sm bg-slate-50/50"
                      placeholder="在此输入 Markdown 内容..."
                    />
                  </div>
                  <div className="flex flex-col h-full">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      实时预览
                    </label>
                    <div className="flex-1 w-full p-6 border border-slate-200 rounded-xl bg-white overflow-y-auto shadow-sm">
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{editForm.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{selectedDoc.name}</h1>
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> {selectedDoc.author}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 最近更新: {selectedDoc.date}</span>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{selectedDoc.content}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => { setShowHistory(false); setPreviewVersion(null); }}>
          <div className="bg-white shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  版本历史: {selectedDoc.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">查看过往版本，或回滚到指定版本。</p>
              </div>
              <button 
                onClick={() => { setShowHistory(false); setPreviewVersion(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Timeline */}
              <div className="w-1/3 border-r border-slate-100 overflow-y-auto p-4 bg-slate-50/30">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {selectedDoc.versionHistory?.map((ver: any, index: number) => (
                    <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                        previewVersion?.id === ver.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                      } transition-colors cursor-pointer z-10`} onClick={() => setPreviewVersion(ver)}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${
                        previewVersion?.id === ver.id ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`} onClick={() => setPreviewVersion(ver)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{ver.version}</span>
                          {index === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">当前</span>}
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{ver.date} · {ver.author}</div>
                        <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">{ver.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="w-2/3 flex flex-col bg-white">
                {previewVersion ? (
                  <>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <div className="text-sm font-bold text-slate-800">预览版本: {previewVersion.version}</div>
                        <div className="text-xs text-slate-500">{previewVersion.date} · {previewVersion.author}</div>
                      </div>
                      {selectedDoc.versionHistory?.[0]?.id !== previewVersion.id && (
                        <button 
                          onClick={() => handleRollback(previewVersion)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm border border-indigo-200"
                        >
                          <RotateCcw className="w-4 h-4" />
                          回滚至此版本
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewVersion.content}</ReactMarkdown>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p>在左侧选择一个版本进行预览</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
