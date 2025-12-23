
import { TelemetryData, Incident } from '../types';

export class TelemetrySystem {
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

  static calculateHallucinationHeuristic(problem: string, solution: string): number {
    // Simulated heuristic: Check if specific client keywords are dropped or replaced
    // In production, this would use a reference-based evaluation model
    return Math.random() * 0.15; // Usually low for Gemini 3
  }

  static generateIncident(type: Incident['type'], message: string): Incident {
    return {
      id: `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type,
      severity: type === 'LATENCY' || type === 'ERROR_RATE' ? 'CRITICAL' : 'WARNING',
      message,
      timestamp: Date.now(),
      remediationStatus: 'PENDING',
      playbookLink: 'https://docs.google.com/playbooks/gcp-ai-resilience'
    };
  }
}
