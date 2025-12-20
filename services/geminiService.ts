
import { GoogleGenAI, Type } from "@google/genai";
import { SolutionRecommendation } from "../types";

export const generateCloudSolution = async (problemDescription: string): Promise<SolutionRecommendation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a senior Google Cloud Partner Solution Architect. Review the following business problem and design a robust GCP solution: "${problemDescription}"`,
    config: {
      systemInstruction: "You are a Google Cloud Solution Architect. Your goal is to help partners design scalable, secure, and cost-effective solutions. Always provide clear, technical, and professional advice.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemSummary: {
            type: Type.STRING,
            description: "A concise summary of the business challenge.",
          },
          recommendedServices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The name of the GCP service (e.g., GKE, Cloud Spanner)." },
                reason: { type: Type.STRING, description: "Why this service is appropriate for this specific problem." }
              },
              required: ["name", "reason"]
            }
          },
          architectureOverview: {
            type: Type.STRING,
            description: "A high-level text description of the proposed system architecture and flow.",
          },
          bestPractices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of relevant GCP best practices (e.g., IAM, monitoring).",
          },
          notes: {
            type: Type.STRING,
            description: "Additional implementation notes or potential risks to consider.",
          }
        },
        required: ["problemSummary", "recommendedServices", "architectureOverview", "bestPractices", "notes"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI engine");
  }

  return JSON.parse(text) as SolutionRecommendation;
};
