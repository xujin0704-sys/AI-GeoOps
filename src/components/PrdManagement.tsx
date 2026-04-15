import React, { useState } from 'react';
import { FileText, Sparkles, Clock, ChevronRight, Download, History, FileSignature, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock PRD data
const initialPrds = [
  {
    id: 'prd-v1-0-0',
    version: 'V1.0.0',
    date: new Date().toISOString().split('T')[0],
    title: 'AI-GeoOps 产线智能管家 V1.0 核心系统',
    summary: '涵盖当前所有核心功能模块的研发级需求说明，支持研发团队直接进行开发与架构设计。',
    content: `# AI-GeoOps 产线智能管家 V1.0 产品需求文档 (研发级)

## 1. 产品概述
AI-GeoOps 是一款面向空间数据生产与运营（如POI采集、清洗、核实、货运调度）的智能化管家系统。系统通过引入大语言模型（LLM）Agent，将传统的“人拉肩扛”式产线管理升级为“AI驱动”的自动化调度与知识管理平台。本 PRD 详细定义了 V1.0 版本的所有核心模块，供研发团队直接作为开发依据。

## 2. 技术栈与架构要求
- **前端框架**: React 18 + Vite + TypeScript
- **UI/样式**: Tailwind CSS + Lucide React (图标) + Framer Motion (交互动画)
- **状态管理**: React Context (TaskContext, SopContext, DictionaryContext)
- **核心组件**: React Markdown (文档渲染), 内部自定义流程图组件 (SOP管理)
- **布局架构**: 左侧固定导航栏 (Sidebar) + 顶部状态栏 (TopNav) + 主内容路由区 + 全局悬浮智能助手 (Drawer)。

## 3. 核心功能模块 (详细需求)

### 3.1 全局智能助手 (Global AI Assistant)
- **功能定位**: 贯穿全系统的对话式交互入口，支持用户通过自然语言完成系统操作。
- **UI/UX 要求**:
  - **入口**: 位于屏幕右下角的悬浮按钮（红色机器人图标），支持在全局视口内自由拖拽 (\`framer-motion\` drag)。
  - **展开形态**: 点击后从右侧滑出抽屉式 (Drawer) 面板。默认宽度为 \`400px\`。
  - **空状态引导**: 首次打开时，展示欢迎语及 3 个场景化 Prompt 快捷按钮（如：“一句话创建任务”、“场景与能力推荐”、“复杂编排咨询”）。
- **功能逻辑**:
  - **消息流**: 用户输入文本后，前端将消息追加至聊天列表，并展示 Loading 状态。调用底层 \`getAgentResponse\` 接口获取 AI 回复。
  - **意图识别与隐式调用**: 
    - 当 AI 返回的 \`agent_used\` 字段为 \`'TaskManager'\` 且包含 \`decision_card\` 时，前端需自动解析卡片中的 \`title\`、\`metrics\` (频率、Agent名称)，并隐式调用 \`addTask\` 方法将新任务写入全局 TaskContext。
  - **地图联动机制**: 
    - 若 AI 返回的数据包含 \`map_data\` 字段，抽屉宽度需平滑过渡扩展至 \`80vw\`。
    - 抽屉左侧区域渲染 \`MapPanel\` 组件，利用高德地图/Leaflet等引擎展示空间数据点位，右侧保持聊天对话框。

### 3.2 产线管理看板 (Mission Control)
- **功能定位**: 系统的默认首页，提供全局产线运行状态的宏观监控。
- **UI/UX 要求**:
  - 采用网格布局 (Bento Grid) 展示各类数据卡片。
- **功能逻辑**:
  - **核心指标卡片**: 展示“今日任务完成率”、“活跃 Agent 数量”、“异常告警数”等。数据需从 \`TaskContext\` 中实时计算（如统计 status 为 'active' 的任务数）。
  - **趋势图表**: 预留折线图/柱状图区域，展示近 7 日的 API 调用量或任务执行趋势（V1.0 可使用模拟数据渲染）。
  - **快捷入口**: 提供跳转至“任务调度”、“SOP管理”等高频模块的快捷链接。

### 3.3 任务调度监控 (Cron Tasks)
- **功能定位**: 管理周期性、自动化的产线检查与处理任务。
- **UI/UX 要求**:
  - **列表视图**: 表格或卡片形式展示任务列表。每行需包含：任务名称、所属产线、执行Agent、调度频率 (Cron表达式)、下次执行时间、状态开关。
  - **详情面板**: 点击任务行可展开侧边栏或弹窗，查看任务的详细配置、执行历史记录 (Logs) 和异常分析结果。
- **功能逻辑**:
  - **任务创建**: 提供“新建任务”按钮，弹出表单。必填项包括：任务名称、产线选择、Agent选择（从可用的 Agent 列表中选择）、Cron 表达式。
  - **状态控制**: 提供 Play/Pause 切换按钮，点击后更新 \`TaskContext\` 中对应任务的 \`status\` 字段。
  - **异常展示**: 若任务包含 \`anomalyData\`，需在详情页以高亮形式展示异常点位或错误日志。

### 3.4 产线SOP管理 (SOP Management)
- **功能定位**: 产线标准作业程序 (Standard Operating Procedure) 的可视化编排与沉淀。
- **UI/UX 要求**:
  - **左侧组件库**: 提供可拖拽的节点类型（如：人工审核节点、大模型处理节点、条件判断节点）。
  - **中央画布**: 支持无限画布缩放与拖拽，支持节点间的连线交互。
  - **右侧配置面板**: 选中节点后，右侧展示该节点的属性配置（如：节点名称、执行人、Prompt 模板）。
- **功能逻辑**:
  - **数据结构**: 维护 \`nodes\` 和 \`edges\` 数组。
  - **容错机制 (Critical)**: 渲染节点图标时，若节点数据缺失 \`icon\` 属性，必须提供默认图标回退（如 \`MapPin\` 或 \`Box\`），严禁抛出 \`Element type is invalid\` 导致整个画布崩溃白屏。
  - **导入导出**: 支持将当前画布的 SOP 结构导出为 JSON 文件，并支持 JSON 文件的导入还原。

### 3.5 产线Wiki管理 (Wiki Management)
- **功能定位**: 产线知识库、规范文档、数据字典的沉淀与版本管理。
- **UI/UX 要求**:
  - **左侧目录树**: 支持多级文件夹的折叠/展开，支持按分类（如：采集规范、质检标准）归属文档。顶部包含全局搜索框。
  - **右侧内容区**: 默认展示 Markdown 渲染后的文档内容。点击“编辑”进入编辑模式。
  - **编辑模式**: 采用双栏布局，左侧为 Markdown 源码输入框，右侧为实时渲染预览区。
- **功能逻辑**:
  - **全局搜索**: 搜索框输入关键词后（需做防抖处理），在左侧目录树中过滤出匹配的文档，并在右侧预览区高亮匹配的文本。
  - **版本控制**: 
    - 每次点击“保存”时，需弹窗要求输入“更新说明 (Note)”。
    - 保存后，将当前内容作为一个新版本（如 \`v1.0.1\`）推入该文档的 \`versionHistory\` 数组中。
    - 提供“历史版本”查看入口，支持在弹窗中预览过往版本内容，并提供“回滚至此版本”功能。

### 3.6 Agent与Skill管理 (Claw Store & Skill Store)
- **功能定位**: 维护系统可用的 AI Agent（智能体）列表及底层 Skill（原子能力）插件库。
- **UI/UX 要求**:
  - 采用响应式网格卡片布局 (Grid)。
  - 卡片需展示：图标、名称、简短描述、分类标签、调用热度（如使用次数）、状态（已启用/未启用）。
- **功能逻辑**:
  - **分类筛选**: 顶部提供分类 Tab（如：数据清洗、空间分析、文本生成），点击可过滤列表。
  - **详情展示**: 点击卡片弹出详情 Modal，展示该 Agent/Skill 的详细能力说明、输入/输出参数格式 (Schema) 及调用示例。

### 3.7 系统配置与PRD管理 (System Settings & PRD)
- **功能定位**: 全局系统参数配置及研发需求文档自动化管理。
- **功能逻辑**:
  - **Token&API管理**: 
    - 提供表单用于配置大模型 API Key（如 Gemini API Key）及第三方服务 Token。
    - 密码框需支持明文/密文切换显示。
    - 前端仅做界面展示与 \`localStorage\` 状态保存，实际生产环境需考虑加密或后端代理。
  - **PRD管理**:
    - **历史存档**: 左侧以时间倒序的时间线视图展示历史 PRD 版本列表。
    - **自动化生成**: 右上角提供“基于对话生成今日PRD”按钮。点击后触发 \`isGenerating\` 状态（展示 Loader 动画），模拟调用大模型总结当日变更（延时 2.5s），随后生成一份结构化的 Markdown PRD 并插入到列表顶部。
    - **文档渲染**: 右侧主区域使用 \`react-markdown\` 结合 \`remark-gfm\` 渲染选中的 PRD 内容。

## 4. 核心数据模型参考 (TypeScript Interfaces)

\`\`\`typescript
// 任务模型
interface Task {
  id: string;
  name: string;
  agent: string;
  schedule: string;
  status: 'active' | 'paused';
  description: string;
  logs: string;
}

// Wiki文档模型
interface WikiDoc {
  id: string;
  name: string;
  content: string;
  author: string;
  date: string;
  versionHistory: Array<{
    id: string;
    version: string;
    date: string;
    author: string;
    content: string;
    note: string;
  }>;
}

// 聊天消息模型
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentResponse?: AgentResponse;
}
\`\`\`

## 5. 非功能性需求
- **响应式设计**: 主体布局需适配 1080p 及以上分辨率桌面端显示器。左侧导航栏在小屏幕下可折叠。
- **交互反馈**: 所有按钮点击、状态切换需有明确的 \`hover\` 态和过渡动画 (\`transition-all duration-200\`)。
- **空状态处理**: 列表数据为空时，需展示友好的 Empty State 提示插画与文案，避免出现空白页面。`
  },
  {
    id: 'prd-20240413',
    version: 'v1.2.0',
    date: '2024-04-13',
    title: '产线Wiki与SOP优化',
    summary: '新增产线Wiki管理模块，修复SOP详情页白屏问题。',
    content: `# 产线智能管家 PRD (v1.2.0)

## 1. 变更摘要
本次更新主要聚焦于知识库管理的完善以及系统稳定性的提升。新增了“产线Wiki管理”模块，并修复了已知的SOP详情页渲染崩溃问题。

## 2. 新增功能
### 2.1 产线Wiki管理
- **目录树导航**: 支持多级目录的折叠与展开。
- **Markdown支持**: 文档内容全面支持Markdown格式，提供实时预览。
- **版本控制**: 实现文档的版本历史记录与回滚功能。
- **全局搜索**: 支持对文档标题和正文的关键词高亮搜索。

## 3. 缺陷修复
### 3.1 SOP详情页白屏 (Bug #1024)
- **问题描述**: 当SOP节点缺少图标数据时，React抛出 \`Element type is invalid\` 错误导致页面白屏。
- **修复方案**: 在 \`SopFlowNode\` 组件中增加防御性检查，当 \`data.icon\` 为空时提供默认的 \`MapPin\` 图标回退。

## 4. 遗留问题
- Wiki文档暂不支持图片上传，计划在 v1.3.0 中支持。`
  },
  {
    id: 'prd-20240410',
    version: 'v1.1.0',
    date: '2024-04-10',
    title: '定时任务与Agent编排',
    summary: '引入Cron定时任务管理，优化Agent编排逻辑。',
    content: `# 产线智能管家 PRD (v1.1.0)

## 1. 变更摘要
本次更新引入了定时任务模块，允许系统自动化执行周期性产线检查任务。

## 2. 新增功能
### 2.1 定时任务管理 (Cron Tasks)
- 支持通过 Cron 表达式配置自动化任务。
- 提供任务执行历史与日志查看。
- 支持手动触发与启停任务。

## 3. 优化
- 优化了 Agent 编排的底层逻辑，提升了并发处理能力。`
  }
];

export default function PrdManagement() {
  const [prds, setPrds] = useState(initialPrds);
  const [selectedPrd, setSelectedPrd] = useState(initialPrds[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTodayPrd = () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const newPrd = {
        id: `prd-${Date.now()}`,
        version: 'v1.3.0',
        date: today,
        title: 'PRD自动化管理模块',
        summary: '基于历史对话记录，自动化总结并生成每日PRD存档。',
        content: `# 产线智能管家 PRD (v1.3.0)

## 1. 变更摘要
本次更新在“系统管理”下新增了“PRD管理”模块，旨在通过大模型能力，自动化总结每日的研发对话与变更，生成标准化的产品需求文档（PRD）并存档。

## 2. 新增功能
### 2.1 PRD自动化生成
- **对话总结**: 自动提取当天的对话记录、代码变更和用户需求。
- **一键生成**: 点击“基于对话生成今日PRD”按钮，调用大模型生成结构化文档。
- **Markdown渲染**: 支持标准Markdown格式的PRD展示。

### 2.2 PRD历史存档
- **时间线视图**: 以时间倒序展示历史PRD版本。
- **版本追溯**: 方便团队成员随时查阅过往的需求变更记录。

## 3. 预期收益
- 极大减少产品经理与研发人员手动编写文档的时间。
- 确保代码变更与需求文档的强一致性。
- 提升团队协作与信息同步效率。`
      };
      
      setPrds([newPrd, ...prds]);
      setSelectedPrd(newPrd);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileSignature className="w-6 h-6 text-indigo-500" />
              PRD管理 (PRD Archive)
            </h1>
            <p className="text-slate-500 mt-1">基于研发对话自动总结变更，生成并存档每日产品需求文档。</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateTodayPrd}
              disabled={isGenerating}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {isGenerating ? 'AI生成中...' : '基于对话生成今日PRD'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex w-full">
        {/* Sidebar - PRD Timeline */}
        <div className="w-80 shrink-0 border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <History className="w-4 h-4" />
              历史版本存档
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {prds.map((prd) => (
              <div 
                key={prd.id}
                onClick={() => setSelectedPrd(prd)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPrd.id === prd.id 
                    ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">{prd.version}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {prd.date}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">{prd.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {prd.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedPrd.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{selectedPrd.version}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 生成日期: {selectedPrd.date}</span>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="下载PDF">
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <div className="prose prose-slate prose-indigo max-w-none text-slate-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedPrd.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
