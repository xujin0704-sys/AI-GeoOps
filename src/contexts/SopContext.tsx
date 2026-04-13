import React, { createContext, useState, useContext } from 'react';
import { MapPin, Database, Mail, ShieldCheck, Terminal, Layers } from 'lucide-react';

export const INITIAL_SOPS = [
  {
    id: 1,
    name: '标准POI数据清洗SOP',
    production_line: 'POI产线',
    description: '用于日常新增POI数据的标准化清洗与分发流程。',
    version: 'v1.0.0',
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-01', author: 'POI Team', description: '初始版本发布' }
    ],
    nodes: [
      { step: 1, name: '拉取 Kafka 队列', type: 'Database', icon: Database },
      { step: 2, name: '资料分析Agent', type: 'Agent', icon: MapPin },
      { step: 3, name: '产线任务分发Agent', type: 'Agent', icon: Mail }
    ]
  },
  {
    id: 2,
    name: '大POI深度核实SOP',
    production_line: 'POI产线',
    description: '针对大型商场、景区等复杂POI的深度核实与多轮质检流程。',
    version: 'v1.1.0',
    versionHistory: [
      { version: 'v1.1.0', date: '2024-01-15', author: 'POI Team', description: '优化了质检Agent的判定逻辑' },
      { version: 'v1.0.0', date: '2023-12-05', author: 'POI Team', description: '初始版本发布' }
    ],
    nodes: [
      { step: 1, name: '任务分发Agent', type: 'Agent', icon: Mail },
      { step: 2, name: 'POI作业Agent', type: 'Agent', icon: MapPin },
      { step: 3, name: 'POI质检Agent', type: 'Agent', icon: ShieldCheck },
      { step: 4, name: '人工作业 (按需)', type: 'Manual', icon: Terminal },
      { step: 5, name: '入库', type: 'Database', icon: Database }
    ]
  },
  {
    id: 3,
    name: '道路网拓扑检查SOP',
    production_line: '道路产线',
    description: '排查路网连通性风险，识别断头路、施工封路等异常。',
    version: 'v1.0.0',
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-10', author: 'Road Team', description: '初始版本发布' }
    ],
    nodes: [
      { step: 1, name: '路网数据快照提取', type: 'Database', icon: Database },
      { step: 2, name: '异常感知与风险阻断智能体', type: 'Agent', icon: ShieldCheck },
      { step: 3, name: '预警报告生成', type: 'Agent', icon: Mail }
    ]
  }
];

interface SopContextType {
  sops: any[];
  setSops: (sops: any[]) => void;
  addSop: (sop: any) => void;
  updateSop: (id: number, updates: any) => void;
  deleteSop: (id: number) => void;
}

const SopContext = createContext<SopContextType | undefined>(undefined);

export const SopProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [sops, setSops] = useState<any[]>(INITIAL_SOPS);

  const addSop = (sop: any) => {
    const newSop = {
      ...sop,
      id: Date.now(),
      isCustom: true,
      version: sop.version || 'v1.0.0',
      versionHistory: sop.versionHistory || [
        { version: sop.version || 'v1.0.0', date: new Date().toISOString().split('T')[0], author: 'Current User', description: '初始版本发布' }
      ]
    };
    setSops(prev => [newSop, ...prev]);
  };

  const updateSop = (id: number, updates: any) => {
    setSops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSop = (id: number) => {
    setSops(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SopContext.Provider value={{ sops, setSops, addSop, updateSop, deleteSop }}>
      {children}
    </SopContext.Provider>
  );
};

export const useSops = () => {
  const context = useContext(SopContext);
  if (!context) throw new Error('useSops must be used within SopProvider');
  return context;
};
