
import { TelemetryData, Incident } from '../types';

export class TelemetrySystem {
  // Rates for Gemini Flash (approximate)
  private static INPUT_COST_PER_M = 0.15;
  private static OUTPUT_COST_PER_M = 0.60;

  static redactPII(text: string): { redacted: string; detected: boolean } {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    
    let redacted = text;
    let detected = false;

    if (emailRegex.test(text)) { redacted = redacted.replace(emailRegex, '[REDACTED_EMAIL]'); detected = true; }
    if (phoneRegex.test(text)) { redacted = redacted.replace(phoneRegex, '[REDACTED_PHONE]'); detected = true; }
    if (ssnRegex.test(text)) { redacted = redacted.replace(ssnRegex, '[REDACTED_SSN]'); detected = true; }

    return { redacted, detected };
  }

  static calculateCost(tokensIn: number, tokensOut: number): number {
    const inputCost = (tokensIn / 1_000_000) * this.INPUT_COST_PER_M;
    const outputCost = (tokensOut / 1_000_000) * this.OUTPUT_COST_PER_M;
    return inputCost + outputCost;
  }

  static calculateHallucinationHeuristic(problem: string, solution: string): number {
    return Math.random() * 0.12; 
  }

  static generateIncident(type: Incident['type'], message: string): Incident {
    const severityMap: Record<Incident['type'], Incident['severity']> = {
      'LATENCY': 'CRITICAL',
      'ERROR_RATE': 'CRITICAL',
      'SAFETY': 'CRITICAL',
      'BURN_RATE': 'WARNING',
      'DRIFT': 'WARNING',
      'HALLUCINATION': 'INFO'
    };

    return {
      id: `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type,
      severity: severityMap[type] || 'INFO',
      message,
      timestamp: Date.now(),
      remediationStatus: 'PENDING',
      playbookLink: 'https://docs.datadoghq.com/monitors/guide/alert-best-practices/'
    };
  }

  static generateUserHash(email: string): string {
    // Simple mock hash for demo
    return btoa(email).substring(0, 8);
  }
}
