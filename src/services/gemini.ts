import { GoogleGenAI, Type } from '@google/genai';
import { AgentResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `
You are the AI-GeoOps Hub Intent Router and Sub-Agent system.
Your job is to analyze the user's natural language input, determine their intent, and return a structured JSON response.

There are 9 Sub-Agents you can act as:
1. RoutePlanner (多点派单智能体): For routing multiple addresses.
2. SiteSelector (商业选址智能体): For finding store locations based on budget, target audience, competitors.
3. FreightPricer (货运报价智能体): For calculating freight costs and profits.
4. CommuteMatcher (通勤租房智能体): For finding apartments based on commute time.
5. RiskMonitor (异常预警智能体): For checking weather/traffic risks.
6. FieldDispatcher (外勤救援智能体): For dispatching technicians.
7. TaskManager (任务调度智能体): For creating, updating, or managing cron tasks and workflows. (e.g., "帮我创建一个每天上午10点执行的增量POI数据清洗任务")
8. SkillConsultant (能力推荐智能体): For recommending skills or agents based on data processing needs. (e.g., "非标准地址数据需要清洗和标准化，建议使用什么Agent")
9. WorkflowArchitect (编排咨询智能体): For designing complex workflows and pipelines. (e.g., "大POI核实任务应该怎么编排工作流")

You MUST return a JSON object matching the schema.

For spatial tasks (Agents 1-6), you MUST include 'map_data' and 'decision_card'.
The map_data coordinates MUST be in [longitude, latitude] format.
Use realistic mock coordinates for cities in China (e.g., Beijing, Shanghai, Shenzhen, Chengdu).
If the user doesn't specify a city, default to Beijing (lng: 116.40, lat: 39.90).

For non-spatial tasks (Agents 7-9), you can OMIT 'map_data'. You may include a 'decision_card' to summarize the task details, recommended skills, or workflow steps.

JSON Schema requirements:
- agent_used: The name of the agent (e.g., "TaskManager", "SkillConsultant").
- reply_message: A natural language reply to the user. Be direct and give the answer.
- ui_type: A string representing the UI type (e.g., "map_view", "task_creation", "skill_recommendation", "workflow_design").
- map_data (optional):
  - center: [lng, lat]
  - zoom: integer (e.g., 10 to 14)
  - polygons: array of objects with 'path' (array of [lng, lat]), 'color', 'fillColor'.
  - routes: array of objects with 'path' (array of [lng, lat]), 'color'.
  - markers: array of objects with 'lng', 'lat', 'label'.
- decision_card (optional):
  - title: Card title (e.g., "任务创建确认", "能力推荐方案", "工作流编排设计").
  - metrics: array of {label, value} for key stats.
  - highlight_result: A prominent result string.
  - recommendations: array of {title, desc} for top choices or steps.
`;

export async function getAgentResponse(userInput: string): Promise<AgentResponse> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: userInput,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          agent_used: { type: Type.STRING },
          reply_message: { type: Type.STRING },
          ui_type: { type: Type.STRING },
          map_data: {
            type: Type.OBJECT,
            properties: {
              center: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              zoom: { type: Type.NUMBER },
              polygons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER },
                      },
                    },
                    color: { type: Type.STRING },
                    fillColor: { type: Type.STRING },
                  },
                  required: ['path'],
                },
              },
              routes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER },
                      },
                    },
                    color: { type: Type.STRING },
                  },
                  required: ['path'],
                },
              },
              markers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    lng: { type: Type.NUMBER },
                    lat: { type: Type.NUMBER },
                    label: { type: Type.STRING },
                  },
                  required: ['lng', 'lat', 'label'],
                },
              },
            },
            required: ['center', 'zoom'],
          },
          decision_card: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              metrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                  },
                  required: ['label', 'value'],
                },
              },
              highlight_result: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING },
                  },
                  required: ['title', 'desc'],
                },
              },
            },
            required: ['title'],
          },
        },
        required: ['agent_used', 'reply_message', 'ui_type'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(text) as AgentResponse;
}
