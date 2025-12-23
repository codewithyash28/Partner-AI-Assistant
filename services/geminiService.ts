
import { GoogleGenAI, Type } from "@google/genai";
import { SolutionRecommendation, TelemetryData } from "../types";
import { TelemetrySystem } from "./telemetry";

export const generateCloudSolution = async (problemDescription: string): Promise<{ solution: SolutionRecommendation; telemetry: TelemetryData }> => {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  // 1. PII Scrubbing (Simulated Backend Middleware)
  const { redacted: safePrompt, detected: piiFound } = TelemetrySystem.redactPII(problemDescription);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a senior GCP Architect. Design a solution for: "${safePrompt}"`,
    config: {
      systemInstruction: "You are a Google Cloud Solution Architect. Output strictly JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemSummary: { type: Type.STRING },
          recommendedServices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["name", "reason"]
            }
          },
          architectureOverview: { type: Type.STRING },
          bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
          notes: { type: Type.STRING }
        },
        required: ["problemSummary", "recommendedServices", "architectureOverview", "bestPractices", "notes"],
      },
    },
  });

  const endTime = performance.now();
  const text = response.text || "{}";
  const solution = JSON.parse(text) as SolutionRecommendation;

  // 2. Telemetry Enrichment
  const telemetry: TelemetryData = {
    requestId,
    latencyMs: Math.round(endTime - startTime),
    tokensIn: safePrompt.length / 4, // Simulated
    tokensOut: text.length / 4, // Simulated
    model: "gemini-3-flash-preview",
    timestamp: Date.now(),
    safetyFlags: [],
    hallucinationScore: TelemetrySystem.calculateHallucinationHeuristic(safePrompt, text),
    driftScore: Math.random() * 0.05,
    isPiiDetected: piiFound
  };

  return { solution, telemetry };
};
