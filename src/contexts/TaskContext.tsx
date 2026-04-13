import React, { createContext, useState, useContext } from 'react';
import { Mail, MapPin, ShieldCheck, Terminal, Database } from 'lucide-react';

export const INITIAL_TASKS = [
  { 
    id: 4, 
    name: '每日增量POI数据清洗与分发', 
    production_line: 'POI产线',
    agent: '核心调度层 - 资料分析Agent', 
    schedule: '每天 10:00', 
    nextRun: '今天 10:00', 
    status: 'active',
    description: '每天上午10点定时从Kafka队列拉取新增POI数据，调用资料分析Agent进行清洗，完成后由产线任务分发Agent派发。',
    totalExecutions: 128,
    aiAnomalySummary: '发现 5 条POI缺失省市信息，已自动补全；3 条POI无法解析，已标记为异常。',
    anomalyData: [
      { id: 'a1', type: '缺失省市信息', count: 5, action: '已调用 LLM 自动推断补全', level: 'warning', requiresManual: false },
      { id: 'a2', type: 'POI无法解析', count: 3, action: '已拦截并标记为异常，等待人工处理', level: 'critical', requiresManual: true, status: 'pending', rawData: [
        { id: 'r1', address: '火星基地1号', reason: '超出地球范围' },
        { id: 'r2', address: '翻斗大街翻斗花园二号楼1001室', reason: '虚构地址' },
        { id: 'r3', address: '北京市朝阳区', reason: '缺少详细门牌号' }
      ]}
    ],
    workflow: [
      { step: 1, name: '拉取 Kafka 队列', type: 'Database', icon: Database },
      { step: 2, name: '资料分析Agent', type: 'Agent', icon: MapPin },
      { step: 3, name: '产线任务分发Agent', type: 'Agent', icon: Mail }
    ],
    batches: [
      { id: 'B-20260318-1000', startTime: '2026-03-18 10:00:00', endTime: '2026-03-18 10:02:15', status: 'success', records: 1250, aiAnomalySummary: '无异常', logs: '[2026-03-18 10:00:00] INFO: Task started...\n[2026-03-18 10:02:15] INFO: Task completed successfully.' },
      { id: 'B-20260317-1000', startTime: '2026-03-17 10:00:00', endTime: '2026-03-17 10:01:45', status: 'success', records: 980, aiAnomalySummary: '发现 2 条地址缺失省市信息，已自动补全。', logs: '[2026-03-17 10:00:00] INFO: Task started...\n[2026-03-17 10:01:45] INFO: Task completed successfully.' },
      { id: 'B-20260316-1000', startTime: '2026-03-16 10:00:00', endTime: '2026-03-16 10:05:12', status: 'failed', records: 450, aiAnomalySummary: '发现 3 条地址无法解析，已标记为异常。数据库连接超时。', logs: '[2026-03-16 10:00:00] INFO: Task started...\n[2026-03-16 10:05:12] ERROR: Database connection timeout.' }
    ],
    dashboardUrl: 'https://example.com/dashboard/poi-sync',
    logs: `[2026-03-18 10:00:00] INFO: Task started...
[2026-03-18 10:00:05] INFO: Fetched 1250 new address records from database.
[2026-03-18 10:00:10] INFO: Calling AI-GeoOps Address Cleaning Skill...
[2026-03-18 10:02:00] INFO: Successfully cleaned 1245 records. 5 records failed validation.
[2026-03-18 10:02:05] INFO: Generating summary report...
[2026-03-18 10:02:10] INFO: Connecting to SMTP server (smtp.example.com:587)...
[2026-03-18 10:02:14] INFO: Email sent successfully to admin@example.com.
[2026-03-18 10:02:15] INFO: Task completed successfully.`
  },
  { id: 1, name: '每日早8点道路网拓扑检查', production_line: '道路产线', agent: '异常感知与风险阻断智能体', schedule: '每天 08:00', nextRun: '今天 08:00', status: 'active', description: '每日早晨排查路网连通性风险。', totalExecutions: 45, aiAnomalySummary: '昨日发现 2 处路段因施工断头，已触发预警。', anomalyData: [{ id: 'a3', type: '路网断头', count: 2, action: '已触发预警并重新规划路线', level: 'critical', requiresManual: false }], workflow: [], batches: [], dashboardUrl: 'https://example.com/dashboard/road-topology', logs: 'No logs available.' },
  { id: 2, name: '每周五新增楼栋轮廓提取', production_line: 'AOI/楼栋产线', agent: '图像识别与轮廓提取智能体', schedule: '每周五 18:00', nextRun: '明天 18:00', status: 'active', description: '监控卫星图新增建筑。', totalExecutions: 12, aiAnomalySummary: '本周监测到朝阳区新增 3 处疑似违建，轮廓异常。', anomalyData: [{ id: 'a4', type: '轮廓异常', count: 3, action: '已生成预警报告', level: 'warning', requiresManual: false }], workflow: [], batches: [], logs: 'No logs available.' },
  { id: 3, name: '月底全国地址库规范化复盘', production_line: '地址产线', agent: '地址标准化智能体', schedule: '每月最后一天 23:59', nextRun: '本月31日 23:59', status: 'paused', description: '复盘地址标准化率。', totalExecutions: 8, aiAnomalySummary: '上月华南大区地址解析失败率上升 1.5%，主要受方言地址影响。', anomalyData: [{ id: 'a5', type: '解析失败率异常', count: 1, action: '已归因于方言地址，标记为待优化', level: 'info', requiresManual: false }], workflow: [], batches: [], dashboardUrl: 'https://example.com/dashboard/address-standardization', logs: 'No logs available.' },
  { 
    id: 5, 
    name: '大POI核实任务', 
    production_line: 'POI产线',
    agent: '产线任务分发Agent', 
    schedule: '每天 02:00', 
    nextRun: '明天 02:00', 
    status: 'active',
    description: '每日任务分发Agent识别大POI核实任务，推送给POI作业Agent调用大POI作业Skill进行作业。完成后推送给POI质检Agent检查。没问题的入库；大面积错误退回重做；小面积错误推送人工作业，人工处理后再次质检入库。',
    totalExecutions: 42,
    aiAnomalySummary: '发现 1 批次大面积错误，已打回重做；发现 12 条需要人工核实的小面积错误，已推送人工作业。',
    anomalyData: [
      { id: 'a6', type: '大面积错误 (批次重做)', count: 1, action: '已推送整个批次给POI作业Agent重新作业', level: 'critical', requiresManual: false },
      { id: 'a7', type: '小面积需人工核实', count: 12, action: '已推送给人工作业，等待人工核实后再次质检', level: 'warning', requiresManual: true, status: 'pending', rawData: [
        { id: 'r4', address: '某大型商场内部POI', reason: '层级关系不明确' },
        { id: 'r5', address: '某景区POI', reason: '边界范围模糊' }
      ]}
    ],
    workflow: [
      { step: 1, name: '任务分发Agent', type: 'Agent', icon: Mail },
      { step: 2, name: 'POI作业Agent', type: 'Agent', icon: MapPin },
      { step: 3, name: 'POI质检Agent', type: 'Agent', icon: ShieldCheck },
      { step: 4, name: '人工作业 (按需)', type: 'Manual', icon: Terminal },
      { step: 5, name: '入库', type: 'Database', icon: Database }
    ],
    batches: [
      { id: 'B-20260412-0200', startTime: '2026-04-12 02:00:00', endTime: '2026-04-12 02:45:15', status: 'success', records: 5000, aiAnomalySummary: '发现 12 条需要人工核实的小面积错误，已推送人工作业。', logs: '[2026-04-12 02:00:00] INFO: 任务分发Agent识别到大POI核实任务...\n[2026-04-12 02:05:00] INFO: POI作业Agent开始作业...\n[2026-04-12 02:30:00] INFO: POI质检Agent开始质检...\n[2026-04-12 02:45:15] INFO: 质检完成，部分推送人工。' }
    ],
    logs: `[2026-04-12 02:00:00] INFO: 任务分发Agent识别到大POI核实任务...
[2026-04-12 02:05:00] INFO: 推送任务给POI作业Agent，调用大POI作业Skill...
[2026-04-12 02:30:00] INFO: 任务批次完成，推送给POI质检Agent检查...
[2026-04-12 02:40:00] WARN: 质检发现小面积需人工核实数据 (12条)...
[2026-04-12 02:45:00] INFO: 没问题的数据已入库。
[2026-04-12 02:45:15] INFO: 有问题的数据已推送给人工作业队列。`
  },
];

interface TaskContextType {
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  addTask: (task: any) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tasks, setTasks] = useState<any[]>(INITIAL_TASKS);

  const addTask = (task: any) => {
    setTasks(prev => [{ ...task, id: Date.now() }, ...prev]);
  };

  return (
    <TaskContext.Provider value={{ tasks, setTasks, addTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
