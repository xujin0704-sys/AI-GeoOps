import React, { createContext, useState, useContext } from 'react';
import { MapPin, Database, Mail, ShieldCheck, Terminal, Layers } from 'lucide-react';

export const INITIAL_SOPS = [
  {
    id: 1,
    name: '标准POI数据清洗SOP',
    production_line: 'POI产线',
    description: '用于日常新增POI数据的标准化清洗与分发流程。',
    version: 'v1.0.0',
    scriptPackage: { name: 'poi_clean_v1.zip', size: '1.2MB', uploadDate: '2023-12-01' },
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-01', author: 'POI Team', description: '初始版本发布', fileName: 'poi_clean_v1.zip' }
    ],
    nodes: [
      { id: '1', type: 'sopNode', position: { x: 100, y: 50 }, data: { label: '拉取 Kafka 队列', type: 'Database', icon: Database } },
      { id: '2', type: 'sopNode', position: { x: 100, y: 150 }, data: { label: '资料分析Agent', type: 'Agent', icon: MapPin } },
      { id: '3', type: 'sopNode', position: { x: 100, y: 250 }, data: { label: '产线任务分发Agent', type: 'Agent', icon: Mail } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true }
    ]
  },
  {
    id: 2,
    name: '大POI深度核实SOP',
    production_line: 'POI产线',
    description: '针对大型商场、景区等复杂POI的深度核实与多轮质检流程。',
    version: 'v1.1.0',
    scriptPackage: { name: 'large_poi_verify_v1.1.zip', size: '2.5MB', uploadDate: '2024-01-15' },
    versionHistory: [
      { version: 'v1.1.0', date: '2024-01-15', author: 'POI Team', description: '优化了质检Agent的判定逻辑', fileName: 'large_poi_verify_v1.1.zip' },
      { version: 'v1.0.0', date: '2023-12-05', author: 'POI Team', description: '初始版本发布', fileName: 'large_poi_verify_v1.0.zip' }
    ],
    nodes: [
      { id: '1', type: 'sopNode', position: { x: 100, y: 50 }, data: { label: '任务分发Agent', type: 'Agent', icon: Mail } },
      { id: '2', type: 'sopNode', position: { x: 100, y: 150 }, data: { label: 'POI作业Agent', type: 'Agent', icon: MapPin } },
      { id: '3', type: 'sopNode', position: { x: 100, y: 250 }, data: { label: 'POI质检Agent', type: 'Agent', icon: ShieldCheck } },
      { id: '4', type: 'sopNode', position: { x: 100, y: 350 }, data: { label: '人工作业 (按需)', type: 'Manual', icon: Terminal } },
      { id: '5', type: 'sopNode', position: { x: 100, y: 450 }, data: { label: '入库', type: 'Database', icon: Database } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true }
    ]
  },
  {
    id: 3,
    name: '道路网拓扑检查SOP',
    production_line: '道路产线',
    description: '排查路网连通性风险，识别断头路、施工封路等异常。',
    version: 'v1.0.0',
    scriptPackage: { name: 'road_topo_v1.zip', size: '850KB', uploadDate: '2023-12-10' },
    versionHistory: [
      { version: 'v1.0.0', date: '2023-12-10', author: 'Road Team', description: '初始版本发布', fileName: 'road_topo_v1.zip' }
    ],
    nodes: [
      { id: '1', type: 'sopNode', position: { x: 100, y: 50 }, data: { label: '路网数据快照提取', type: 'Database', icon: Database } },
      { id: '2', type: 'sopNode', position: { x: 100, y: 150 }, data: { label: '异常感知与风险阻断智能体', type: 'Agent', icon: ShieldCheck } },
      { id: '3', type: 'sopNode', position: { x: 100, y: 250 }, data: { label: '预警报告生成', type: 'Agent', icon: Mail } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true }
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
