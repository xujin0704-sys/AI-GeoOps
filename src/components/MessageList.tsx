import React, { useEffect, useRef } from 'react';
import { Loader2, Route, Store, BadgeDollarSign, Compass, ShieldAlert, RadioTower, Bot, CircleCheck, Navigation, TrendingUp, Timer, Lightbulb, Layers } from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  RoutePlanner: <Route className="w-4 h-4" />,
  SiteSelector: <Store className="w-4 h-4" />,
  FreightPricer: <BadgeDollarSign className="w-4 h-4" />,
  CommuteMatcher: <Compass className="w-4 h-4" />,
  RiskMonitor: <ShieldAlert className="w-4 h-4" />,
  FieldDispatcher: <RadioTower className="w-4 h-4" />,
  TaskManager: <Timer className="w-4 h-4" />,
  SkillConsultant: <Lightbulb className="w-4 h-4" />,
  WorkflowArchitect: <Layers className="w-4 h-4" />,
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${
            msg.role === 'user' ? 'items-end' : 'items-start'
          }`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-red-500 text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-800 rounded-tl-sm'
            }`}
          >
            {msg.role === 'assistant' && msg.agentResponse && (
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit border border-red-100">
                {AGENT_ICONS[msg.agentResponse.agent_used] || <Bot className="w-3 h-3" />}
                {msg.agentResponse.agent_used}
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
            {msg.role === 'assistant' && msg.agentResponse?.decision_card && !msg.agentResponse.map_data && (
              <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-sm text-indigo-900">{msg.agentResponse.decision_card.title}</h3>
                </div>
                <div className="p-4 space-y-4">
                  {msg.agentResponse.decision_card.metrics && msg.agentResponse.decision_card.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {msg.agentResponse.decision_card.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">{metric.label}</p>
                          <p className="text-sm font-bold text-slate-800 truncate" title={metric.value}>{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.agentResponse.decision_card.highlight_result && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-2">
                      <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-800 uppercase mb-0.5">核心结论</p>
                        <p className="text-sm font-bold text-emerald-900 leading-snug">{msg.agentResponse.decision_card.highlight_result}</p>
                      </div>
                    </div>
                  )}
                  {msg.agentResponse.decision_card.recommendations && msg.agentResponse.decision_card.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-800 uppercase flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        推荐方案
                      </h4>
                      <div className="space-y-2">
                        {msg.agentResponse.decision_card.recommendations.map((rec, idx) => (
                          <div key={idx} className="pl-3 border-l-2 border-indigo-200">
                            <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start">
          <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在解析意图并调度智能体...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
