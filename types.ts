
export interface CloudService {
  name: string;
  reason: string;
}

export interface SolutionRecommendation {
  problemSummary: string;
  recommendedServices: CloudService[];
  architectureOverview: string;
  bestPractices: string[];
  notes: string;
}

export interface TelemetryData {
  requestId: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  model: string;
  timestamp: number;
  safetyFlags: string[];
  hallucinationScore: number; // 0-1
  driftScore: number; // 0-1
  isPiiDetected: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  problemDescription: string;
  solution: SolutionRecommendation;
  telemetry: TelemetryData;
}

export interface Incident {
  id: string;
  type: 'LATENCY' | 'ERROR_RATE' | 'SAFETY' | 'DRIFT' | 'HALLUCINATION';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: number;
  remediationStatus: 'PENDING' | 'RESOLVED' | 'AUTO_FIXED';
  playbookLink: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type ViewMode = 'ARCHITECT' | 'DASHBOARD' | 'OBSERVABILITY';
