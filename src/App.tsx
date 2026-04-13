/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Store, BadgeDollarSign, Compass, ShieldAlert, RadioTower, Wrench, Bot, X, MessageSquare, Timer, Lightbulb, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import MapPanel from './components/MapPanel';
import SkillStore from './components/SkillStore';
import ClawStore from './components/ClawStore';
import CronTasks from './components/CronTasks';
import DataAnalysisCenter from './components/DataAnalysisCenter';
import Connectors from './components/Connectors';
import TokenApiManager from './components/TokenApiManager';
import MissionControl from './components/MissionControl';
import SystemSettings from './components/SystemSettings';
import { DictionaryProvider } from './contexts/DictionaryContext';
import { TaskProvider, useTasks } from './contexts/TaskContext';
import { ChatMessage, AgentResponse } from './types';
import { getAgentResponse } from './services/gemini';

const SCENARIOS = [
  {
    id: 'TaskCreation',
    name: '一句话创建任务',
    desc: 'Create Task',
    icon: <Timer className="w-5 h-5 text-indigo-500" />,
    prompt: '帮我创建一个每天上午10点执行的"增量POI数据清洗"任务，使用资料分析Agent。'
  },
  {
    id: 'SkillRecommendation',
    name: '场景与能力推荐',
    desc: 'Skill Recommendation',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    prompt: '我有一批包含各地方言的非标准地址数据需要清洗和标准化，建议使用什么Agent或Skill来完成？'
  },
  {
    id: 'WorkflowConsultation',
    name: '复杂编排咨询',
    desc: 'Workflow Consultation',
    icon: <Layers className="w-5 h-5 text-emerald-500" />,
    prompt: '如果我要做一个大POI核实任务，包含自动分发、作业和质检，应该怎么编排工作流？'
  },
  {
    id: 'SiteSelector',
    name: '商业地产与开店选址智能体',
    desc: 'Site Selection Agent',
    icon: <Store className="w-5 h-5 text-blue-500" />,
    prompt: '我准备在成都高新区开一家精品宠物医院，预算有限。帮我找3个合适的选址区域。要求：周边3公里内高档小区多，但同行（其他宠物医院）要少，并且附近最好有大型绿地或公园。'
  },
  {
    id: 'FreightPricer',
    name: '货运报价与利润试算智能体',
    desc: 'Freight Pricing Agent',
    icon: <BadgeDollarSign className="w-5 h-5 text-orange-500" />,
    prompt: '明天下午装车，上海嘉定发往北京大兴，13米高栏，重28吨，绿通（农产品）。客户给5500块钱，帮我算算这趟能跑吗？'
  }
];

export default function App() {
  return (
    <DictionaryProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </DictionaryProvider>
  );
}

function AppContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgentResponse, setCurrentAgentResponse] = useState<AgentResponse | null>(null);
  const [activeView, setActiveView] = useState('mission-control');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addTask } = useTasks();

  const handleNewChat = () => {
    setMessages([]);
    setCurrentAgentResponse(null);
    setIsChatOpen(true);
  };

  const handleSendMessage = async (content: string) => {
    setIsChatOpen(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await getAgentResponse(content);
      
      // If TaskManager is used, automatically create a task based on the decision card
      if (response.agent_used === 'TaskManager' && response.decision_card) {
        const taskName = response.decision_card.title.replace('确认', '').replace('创建', '') || '新任务';
        const scheduleMetric = response.decision_card.metrics?.find(m => m.label.includes('频率') || m.label.includes('时间'))?.value || '未设置';
        const agentMetric = response.decision_card.metrics?.find(m => m.label.includes('Agent') || m.label.includes('智能体'))?.value || '默认Agent';
        
        addTask({
          name: taskName,
          production_line: 'POI产线', // Defaulting for now
          agent: agentMetric,
          schedule: scheduleMetric,
          nextRun: scheduleMetric,
          status: 'active',
          description: response.decision_card.highlight_result || response.reply_message,
          totalExecutions: 0,
          aiAnomalySummary: '暂无异常',
          anomalyData: [],
          workflow: [],
          batches: [],
          logs: 'Task created via Smart Assistant.'
        });
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply_message,
        agentResponse: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentAgentResponse(response);
    } catch (error) {
      console.error('Error getting agent response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，系统处理您的请求时出现错误，请稍后再试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="flex h-screen w-full bg-white overflow-hidden font-sans relative">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onNewChat={() => setActiveView('chat')} />
        
        <div className="flex-1 flex flex-col h-full relative">
          <TopNav />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeView === 'mission-control' ? (
              <MissionControl />
            ) : activeView === 'data-analysis' ? (
              <DataAnalysisCenter />
            ) : activeView === 'skill-store' ? (
              <SkillStore />
            ) : activeView === 'claw-store' ? (
              <ClawStore />
            ) : activeView === 'cron-tasks' ? (
              <CronTasks />
            ) : activeView === 'connectors' ? (
              <Connectors />
            ) : activeView === 'token-api' ? (
              <TokenApiManager />
            ) : activeView === 'system-settings' ? (
              <SystemSettings />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-50 h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">功能开发中</h2>
                  <p className="text-slate-500">此模块 ({activeView}) 正在建设中，敬请期待...</p>
                </div>
              </div>
            )}
          </div>

          {/* Global Chat Bot Button */}
          <motion.div
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => {
              setTimeout(() => setIsDragging(false), 150);
            }}
            className="fixed z-50"
            style={{ bottom: 24, right: 24 }}
          >
            <button
              onClick={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                setIsChatOpen(!isChatOpen);
              }}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-grab active:cursor-grabbing"
            >
              {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
          </motion.div>

          {/* Global Chat Drawer */}
          <div 
            className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 flex ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ width: currentAgentResponse?.map_data ? '80vw' : '400px' }}
          >
            {/* Map Area (if available) */}
            {currentAgentResponse?.map_data && (
              <div className="flex-1 relative bg-slate-50 border-r border-slate-200 z-0">
                <MapPanel agentResponse={currentAgentResponse} />
              </div>
            )}

            {/* Chat Area */}
            <div className="w-[400px] flex flex-col h-full shrink-0 bg-white z-10">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Bot className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-bold text-slate-800">AI-GeoOps 智能助手</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {messages.length === 0 ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="text-center mb-8 mt-4">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">全能调度助手</h2>
                    <p className="text-sm text-slate-500">支持一句话创建任务、场景与能力推荐、复杂编排咨询等。</p>
                  </div>
                  <div className="space-y-3">
                    {SCENARIOS.slice(0, 3).map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleSendMessage(scenario.prompt)}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/30 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {scenario.icon}
                          <span className="font-medium text-sm text-slate-700 group-hover:text-red-600">{scenario.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">"{scenario.prompt}"</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <MessageList messages={messages} isLoading={isLoading} />
              )}
              
              <div className="p-4 border-t border-slate-100 bg-white">
                <ChatInput onSend={handleSendMessage} isLarge={false} disabled={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}


