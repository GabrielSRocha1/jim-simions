
import { GoogleGenAI } from "@google/genai";
import { SimulationState, CalculationResult } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getIncentiveInsights(state: SimulationState, result: CalculationResult) {
  try {
    // Fix: Access properties correctly based on SimulationState and CalculationResult types
    const expectedPriceChange = ((result.projectedPrice / state.tokenPrice) - 1) * 100;
    const tokenGainPct = (result.yieldTokens / result.initialTokens) * 100;

    const prompt = `
      Analyze this crypto incentive engineering scenario:
      - Initial Investment: ${result.initialTokens.toFixed(2)} tokens at $${state.tokenPrice}
      - Lock Duration: ${result.lockWeeks} weeks
      - Base APY: ${result.apy}%
      - Expected Price Change: ${expectedPriceChange.toFixed(2)}%
      
      Results:
      - Effective APY: ${result.apy.toFixed(2)}%
      - Token Quantity Gain: ${result.yieldTokens.toFixed(2)} tokens (${tokenGainPct.toFixed(2)}%)
      - Total Value Gain: ${result.totalRoiPct.toFixed(2)}%
      
      Please provide a professional, concise analysis of the 'Incentive Engineering' efficiency. 
      Specifically address the risk/reward of locking versus holding.
      Keep the tone institutional and data-driven.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are a senior cryptoeconomics and incentive design expert. You analyze protocol yield mechanisms and game theory."
      }
    });

    // Use response.text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights are currently unavailable. Please check your simulation parameters.";
  }
}
