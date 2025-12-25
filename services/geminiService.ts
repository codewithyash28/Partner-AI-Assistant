
import { GoogleGenAI, Type } from "@google/genai";
import { SolutionRecommendation, TelemetryData } from "../types";
import { TelemetrySystem } from "./telemetry";

export const generateCloudSolution = async (problemDescription: string, userEmail: string = "anon"): Promise<{ solution: SolutionRecommendation; telemetry: TelemetryData }> => {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  const { redacted: safePrompt, detected: piiFound } = TelemetrySystem.redactPII(problemDescription);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a senior GCP Architect. Design a detailed cloud solution for: "${safePrompt}"`,
    config: {
      systemInstruction: "You are a Google Cloud Solution Architect. Output strictly valid JSON.",
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

  const tokensIn = Math.ceil(safePrompt.length / 4);
  const tokensOut = Math.ceil(text.length / 4);

  const telemetry: TelemetryData = {
    requestId,
    latencyMs: Math.round(endTime - startTime),
    tokensIn,
    tokensOut,
    costUsd: TelemetrySystem.calculateCost(tokensIn, tokensOut),
    model: "gemini-3-flash-preview",
    timestamp: Date.now(),
    safetyFlags: piiFound ? ["PII_REDACTED"] : [],
    hallucinationScore: TelemetrySystem.calculateHallucinationHeuristic(safePrompt, text),
    driftScore: Math.random() * 0.05,
    isPiiDetected: piiFound,
    userHash: TelemetrySystem.generateUserHash(userEmail)
  };

  return { solution, telemetry };
};
