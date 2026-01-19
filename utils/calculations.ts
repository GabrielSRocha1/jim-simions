
import { SimulationState, CalculationResult, TimelinePoint, LockTier } from "../types";

const TIER_CONFIG: Record<LockTier, { weeks: number; apy: number }> = {
  bronze: { weeks: 52, apy: 25 },   
  silver: { weeks: 113, apy: 65 },  // Approx 26 meses
  gold: { weeks: 156, apy: 160 },   
};

export function calculateIncentives(state: SimulationState): CalculationResult {
  const { investmentUsd, tokenQuantity, tokenPrice, lockTier, marketOptimism, newRoudersPerMonth, ticketPerRouder } = state;
  const config = TIER_CONFIG[lockTier];
  
  const initialTokens = tokenQuantity > 0 ? tokenQuantity : (tokenPrice > 0 ? investmentUsd / tokenPrice : 0);
  const lockWeeks = config.weeks;
  const apy = config.apy;
  
  // Weekly compound rate for tokens
  const periodicRate = Math.pow(1 + (apy / 100), 1 / 52) - 1;
  
  // Community Logic: Network Effect
  const weeklyRouderGrowth = newRoudersPerMonth / 4.33;
  const initialHolders = 1000;

  // TVL Impact / Scarcity logic for price floor
  const capitalInfluence = Math.log10(Math.max(investmentUsd, 1) / 5000 + 1) * 0.15;
  
  const timeline: TimelinePoint[] = [];
  let currentTokens = initialTokens;

  for (let w = 0; w <= lockWeeks; w++) {
    // 1. Calculate cumulative capital influx from community
    // H (Holders/month) converted to weekly influx
    const newHoldersWeekly = (newRoudersPerMonth / 4.33) * w;
    const accumulatedCommunityCapital = newHoldersWeekly * ticketPerRouder;
    
    // 2. Calculate Token Price at week 'w'
    // Formula: P_t = P_0 + (CapitalAccumulated_t / S)
    // We also include Market Optimism and Capital Influence as a "sophistication" multiplier
    const sentimentMultiplier = 1 + (marketOptimism / 100) * 1.5 + capitalInfluence;
    
    // Base price from influx
    const basePriceIncrease = initialTokens > 0 ? (accumulatedCommunityCapital / initialTokens) : 0;
    const currentPrice = (tokenPrice + basePriceIncrease) * sentimentMultiplier;

    const currentHolders = initialHolders + (weeklyRouderGrowth * w);
    const principalValue = initialTokens * currentPrice;
    const yieldValue = (currentTokens - initialTokens) * currentPrice;

    timeline.push({
      week: w,
      tokens: currentTokens,
      tokenPrice: currentPrice,
      totalValue: currentTokens * currentPrice,
      principalValue: principalValue,
      yieldValue: yieldValue,
      communityCount: currentHolders
    });

    if (w < lockWeeks) {
      currentTokens *= (1 + periodicRate);
    }
  }

  const finalResult = timeline[timeline.length - 1];
  const projectedPrice = finalResult.tokenPrice;
  const finalTokens = finalResult.tokens;
  const yieldTokens = finalTokens - initialTokens;
  const totalFutureValue = finalResult.totalValue;

  const principalValueInitial = investmentUsd;
  const appreciationGain = initialTokens * (projectedPrice - tokenPrice);
  const yieldGain = yieldTokens * projectedPrice;

  const totalRoiPct = investmentUsd > 0 ? ((totalFutureValue - investmentUsd) / investmentUsd) * 100 : 0;

  return {
    initialTokens,
    yieldTokens,
    finalTokens,
    projectedPrice,
    principalValueInitial,
    principalValueFinal: initialTokens * projectedPrice,
    yieldValueFinal: yieldTokens * projectedPrice,
    appreciationGain,
    yieldGain,
    totalFutureValue,
    totalRoiPct,
    lockWeeks,
    apy,
    timeline
  };
}
