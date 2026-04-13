export interface MapData {
  center: [number, number]; // [lng, lat]
  zoom: number;
  polygons?: {
    path: [number, number][]; // array of [lng, lat]
    color?: string;
    fillColor?: string;
  }[];
  routes?: {
    path: [number, number][]; // array of [lng, lat]
    color?: string;
  }[];
  markers?: {
    lng: number;
    lat: number;
    label: string;
  }[];
}

export interface DecisionCard {
  title: string;
  metrics?: {
    label: string;
    value: string;
  }[];
  highlight_result?: string;
  recommendations?: {
    title: string;
    desc: string;
  }[];
}

export interface AgentResponse {
  agent_used: string;
  reply_message: string;
  ui_type: string;
  map_data?: MapData;
  decision_card?: DecisionCard;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentResponse?: AgentResponse;
  isLoading?: boolean;
}
