
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

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
