
export type LockTier = 'bronze' | 'silver' | 'gold';

export interface SimulationState {
  investmentUsd: number;
  tokenQuantity: number;
  tokenPrice: number;
  lockTier: LockTier;
  marketOptimism: number; // 0 to 100
  newRoudersPerMonth: number;
  ticketPerRouder: number;
}

export interface CalculationResult {
  initialTokens: number;
  yieldTokens: number;
  finalTokens: number;
  projectedPrice: number;
  
  principalValueInitial: number;
  principalValueFinal: number; 
  yieldValueFinal: number;    
  
  // Breakdown of gains
  appreciationGain: number; // Gain from price increase on original tokens
  yieldGain: number;        // Gain from newly earned tokens at final price
  
  totalFutureValue: number;
  totalRoiPct: number;
  
  lockWeeks: number;
  apy: number;
  
  timeline: TimelinePoint[];
}

export interface TimelinePoint {
  week: number;
  tokens: number;
  tokenPrice: number;
  totalValue: number;
  principalValue: number;
  yieldValue: number;
  communityCount: number;
}
