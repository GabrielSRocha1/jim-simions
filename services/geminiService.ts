import { GoogleGenAI } from "@google/genai";
import { SimulationState, CalculationResult } from "../types";

export async function getIncentiveInsights(state: SimulationState, result: CalculationResult) {
  try {
    // Inicializar dentro da função garante que o app não quebre se process.env não estiver disponível globalmente no navegador
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights are currently unavailable. Please check your simulation parameters.";
  }
}