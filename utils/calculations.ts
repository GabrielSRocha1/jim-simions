
import { SimulationState, CalculationResult, TimelinePoint, LockTier } from "../types";

const TIER_CONFIG: Record<LockTier, { weeks: number; apy: number }> = {
  bronze: { weeks: 52, apy: 25 },   
  silver: { weeks: 113, apy: 65 },  // Approx 26 meses
  gold: { weeks: 156, apy: 160 },   
};

export function calculateIncentives(state: SimulationState): CalculationResult {
  const { investmentUsd, tokenQuantity, tokenPrice, lockTier, marketOptimism, newRoudersPerMonth, ticketPerRouder } = state;
  const config = TIER_CONFIG[lockTier];
  
  // Usamos a quantidade de tokens como base de cálculo para o yield
  const initialTokens = tokenQuantity;
  const lockWeeks = config.weeks;
  const apy = config.apy;
  
  const periodicRate = Math.pow(1 + (apy / 100), 1 / 52) - 1;
  const weeklyRouderGrowth = newRoudersPerMonth / 4.33;
  const initialHolders = 1000;
  const capitalInfluence = Math.log10(Math.max(investmentUsd, 1) / 5000 + 1) * 0.15;
  
  const timeline: TimelinePoint[] = [];
  let currentTokens = initialTokens;

  for (let w = 0; w <= lockWeeks; w++) {
    const newHoldersWeekly = (newRoudersPerMonth / 4.33) * w;
    const accumulatedCommunityCapital = newHoldersWeekly * ticketPerRouder;
    
    const sentimentMultiplier = 1 + (marketOptimism / 100) * 1.5 + capitalInfluence;
    const basePriceIncrease = initialTokens > 0 ? (accumulatedCommunityCapital / initialTokens) : 0;
    const currentPrice = (tokenPrice + basePriceIncrease) * sentimentMultiplier;

    const currentHolders = initialHolders + (weeklyRouderGrowth * w);
    
    // Para o gráfico, mantemos a proporção baseada no valor atual
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

  // Lógica Aditiva Estrita:
  // 1. O principal inicial é exatamente o que o usuário digitou
  const principalValueInitial = investmentUsd;
  
  // 2. O ganho de valorização é calculado sobre o capital inicial (ou tokens iniciais x delta preço)
  // Usamos a variação percentual do preço para garantir que a valorização seja proporcional ao investimento USD
  const priceGrowthMultiplier = tokenPrice > 0 ? (projectedPrice / tokenPrice) : 1;
  const principalValueFinal = principalValueInitial * priceGrowthMultiplier;
  const appreciationGain = principalValueFinal - principalValueInitial;

  // 3. O ganho de yield são os novos tokens valendo o preço projetado
  const yieldGain = yieldTokens * projectedPrice;

  // 4. Valor Total é a soma exata das partes
  const totalFutureValue = principalValueInitial + appreciationGain + yieldGain;

  const totalRoiPct = principalValueInitial > 0 ? ((totalFutureValue - principalValueInitial) / principalValueInitial) * 100 : 0;

  return {
    initialTokens,
    yieldTokens,
    finalTokens,
    projectedPrice,
    principalValueInitial,
    principalValueFinal,
    yieldValueFinal: yieldGain,
    appreciationGain,
    yieldGain,
    totalFutureValue,
    totalRoiPct,
    lockWeeks,
    apy,
    timeline
  };
}
