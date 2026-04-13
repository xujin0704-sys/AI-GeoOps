import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let agents = [
    {
      id: "ag_001",
      name: "多点派单智能体 (RoutePlanner)",
      status: "Running",
      current_task_id: "ms_9921",
      description: "处理包含 20 个地址以上的复杂路线编排",
      cpu_usage: "12%",
      uptime: "2h 15m"
    },
    {
      id: "ag_002",
      name: "商业选址智能体 (SiteSelector)",
      status: "Idle",
      current_task_id: null,
      description: "基于 POI 密度的空间选址计算",
      cpu_usage: "0%",
      uptime: "1d 4h"
    }
  ];

  let missions = [
    {
      mission_id: "ms_9921",
      trigger_by: "User_042",
      intent: "排班 30 个北京快递单",
      status: "Needs_Intervention",
      workflow_steps: [
        {
          step: 1,
          tool: "LLM_Entity_Extraction",
          status: "Success",
          time_spent: "2.4s"
        },
        {
          step: 2,
          tool: "AMap_Geocoding_API",
          status: "Paused",
          error_msg: "地址 [北京新天地] 模糊，解析出 3 个坐标",
          time_spent: "0.8s"
        },
        {
          step: 3,
          tool: "TSP_Route_Optimizer",
          status: "Pending",
          time_spent: "0s"
        }
      ],
      cost_so_far: { tokens: 4200, api_calls: 29 }
    }
  ];

  const dashboardData = {
    kpis: {
      activeAgents: agents.filter(a => a.status === 'Running').length,
      runningMissions: missions.filter(m => m.status === 'Running').length,
      interventionNeeded: missions.filter(m => m.status === 'Needs_Intervention').length,
      todaysCost: 125.40
    },
    chartData: [
      { time: '00:00', requests: 120, successRate: 98 },
      { time: '04:00', requests: 80, successRate: 99 },
      { time: '08:00', requests: 450, successRate: 95 },
      { time: '12:00', requests: 890, successRate: 92 },
      { time: '16:00', requests: 760, successRate: 96 },
      { time: '20:00', requests: 320, successRate: 98 },
      { time: '24:00', requests: 150, successRate: 99 },
    ]
  };

  // API Routes
  app.get("/api/dashboard", (req, res) => {
    // Recalculate KPIs based on current state
    dashboardData.kpis.activeAgents = agents.filter(a => a.status === 'Running').length;
    dashboardData.kpis.runningMissions = missions.filter(m => m.status === 'Running').length;
    dashboardData.kpis.interventionNeeded = missions.filter(m => m.status === 'Needs_Intervention').length;
    res.json(dashboardData);
  });

  app.get("/api/agents", (req, res) => {
    res.json(agents);
  });

  app.get("/api/missions", (req, res) => {
    res.json(missions);
  });

  app.post("/api/mission/resume", (req, res) => {
    const { mission_id, correction } = req.body;
    const mission = missions.find(m => m.mission_id === mission_id);
    if (mission) {
      mission.status = "Running";
      // Update the paused step
      const pausedStep = mission.workflow_steps.find(s => s.status === "Paused");
      if (pausedStep) {
        pausedStep.status = "Success";
        pausedStep.error_msg = undefined;
      }
      // Update the pending step
      const pendingStep = mission.workflow_steps.find(s => s.status === "Pending");
      if (pendingStep) {
        pendingStep.status = "Running";
      }
      res.json({ success: true, message: "Mission resumed successfully." });
    } else {
      res.status(404).json({ success: false, message: "Mission not found." });
    }
  });

  app.post("/api/mission/kill", (req, res) => {
    const { mission_id } = req.body;
    const mission = missions.find(m => m.mission_id === mission_id);
    if (mission) {
      mission.status = "Failed";
      const runningStep = mission.workflow_steps.find(s => s.status === "Running" || s.status === "Paused");
      if (runningStep) {
        runningStep.status = "Failed";
        runningStep.error_msg = "Killed by user";
      }
      res.json({ success: true, message: "Mission killed successfully." });
    } else {
      res.status(404).json({ success: false, message: "Mission not found." });
    }
  });

  app.post("/api/agent/kill", (req, res) => {
    const { agent_id } = req.body;
    const agent = agents.find(a => a.id === agent_id);
    if (agent) {
      agent.status = "Failed";
      res.json({ success: true, message: "Agent killed successfully." });
    } else {
      res.status(404).json({ success: false, message: "Agent not found." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
