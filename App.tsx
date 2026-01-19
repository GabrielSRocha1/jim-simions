
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  Area,
  ComposedChart
} from 'recharts';
import { SimulationState, CalculationResult, LockTier } from './types';
import { calculateIncentives } from './utils/calculations';

type Language = 'pt' | 'en' | 'es';

const translations = {
  en: {
    header_subtitle: "Precision Engineering: Converging Rewards & Network Growth.",
    cta_future: "LOCK IN PLANNING...",
    params_title: "Negotiation Sniper",
    token_quantity: "Token Quantity (Q)",
    token_price: "Entry Price (P)",
    total_investment: "Operating Capital (V)",
    lock_duration: "Incentive Authority Level",
    market_sentiment: "Market Sentiment (Auto)",
    community_dynamics: "Community Engine",
    new_rouders: "New Rouders / Month",
    avg_ticket: "Ticket Avg (USD)",
    total_investment_power: "Allocated Operating Capital",
    estimated_profit_power: "Projected Net Equity",
    potential_roi_power: "Total ROI Multiplier",
    net_profit_power: "Net Wealth Gain",
    growth_chart_title: "Exponential Wealth Horizon",
    growth_chart_sub: "Capital Architecture vs. Network Scale",
    yield_value_label: "Incentive Yield",
    principal_value_label: "Asset Floor",
    community_label: "Network (Holders)",
    token_price_label: "Projected Token Price",
    capital_allocation: "Strategic Allocation Breakdown",
    initial_capital: "Initial Capital (Floor)",
    price_gain: "Market Gain (Price Up)",
    yield_gain: "Protocol Gain (Incentives)",
    bronze: "Bronze Strategy",
    silver: "Silver Performance",
    gold: "Gold Authority",
    bronze_dur: "12 Months",
    silver_dur: "26 Months",
    gold_dur: "36 Months",
    week: "Wk",
    total_balance: "Projected Portfolio",
    tooltip_month_prefix: "Composition at cycle peak:",
    extreme_bullish: "Extreme Bullish",
    steady_growth: "Steady Growth",
    conservative: "Conservative",
    sentiment_hint: "Driven by holder growth"
  },
  pt: {
    header_subtitle: "Engenharia de Precisão: Convergência entre Recompensas e Rede.",
    cta_future: "INICIAR PLANEJAMENTO...",
    params_title: "Sniper de Negociação",
    token_quantity: "Quantidade de Tokens (Q)",
    token_price: "Preço de Entrada (P)",
    total_investment: "Capital em Operação (V)",
    lock_duration: "Nível de Autoridade de Incentivo",
    market_sentiment: "Sentimento de Mercado (Auto)",
    community_dynamics: "Motor de Comunidade",
    new_rouders: "Novos Rouders / Mês",
    avg_ticket: "Ticket Médio (US$)",
    total_investment_power: "Capital Alocado em Operação",
    estimated_profit_power: "Patrimônio Líquido Projetado",
    potential_roi_power: "Multiplicador Total de ROI",
    net_profit_power: "Ganho de Riqueza Líquido",
    growth_chart_title: "Horizonte Exponencial de Riqueza",
    growth_chart_sub: "Arquitetura de Capital vs. Escala de Rede",
    yield_value_label: "Yield de Incentivo",
    principal_value_label: "Base do Ativo",
    community_label: "Rede (Holders)",
    token_price_label: "Preço Estimado do Token",
    capital_allocation: "Divisão de Alocação Estratégica",
    initial_capital: "Capital Inicial (Floor)",
    price_gain: "Ganho de Mercado (Preço)",
    yield_gain: "Ganho de Protocolo (Incentivos)",
    bronze: "Bronze Estratégia",
    silver: "Prata Performance",
    gold: "Ouro Autoridade",
    bronze_dur: "12 meses",
    silver_dur: "26 meses",
    gold_dur: "36 meses",
    week: "Sem",
    total_balance: "Portfólio Projetado",
    tooltip_month_prefix: "Composição no pico do ciclo:",
    extreme_bullish: "Extremo Bullish",
    steady_growth: "Crescimento Estável",
    conservative: "Conservador",
    sentiment_hint: "Gerado pelo crescimento de holders"
  },
  es: {
    header_subtitle: "Ingeniería de Precisión: Convergencia entre Recompensas y Red.",
    cta_future: "INICIAR PLANIFICACIÓN...",
    params_title: "Sniper de Negociación",
    token_quantity: "Cantidad de Tokens (Q)",
    token_price: "Precio de Entrada (P)",
    total_investment: "Capital en Operación (V)",
    lock_duration: "Nivel de Autoridad de Incentivo",
    market_sentiment: "Sentimiento del Mercado (Auto)",
    community_dynamics: "Motor de Comunidad",
    new_rouders: "Nuevos Rouders / Mes",
    avg_ticket: "Ticket Promedio (US$)",
    total_investment_power: "Capital Asignado en Operación",
    estimated_profit_power: "Patrimonio Neto Proyectado",
    potential_roi_power: "Multiplicador Total de ROI",
    net_profit_power: "Ganancia de Riqueza Neta",
    growth_chart_title: "Horizonte Esponencial de Riqueza",
    growth_chart_sub: "Arquitectura de Capital vs. Escala de Red",
    yield_value_label: "Yield de Incentivo",
    principal_value_label: "Base del Ativo",
    community_label: "Red (Holders)",
    token_price_label: "Precio Estimado del Token",
    capital_allocation: "División de Asignación Estratégica",
    initial_capital: "Capital Inicial (Floor)",
    price_gain: "Ganancia de Mercado (Precio)",
    yield_gain: "Ganancia de Protocolo (Incentivos)",
    bronze: "Bronce Estrategia",
    silver: "Plata Performance",
    gold: "Oro Autoridad",
    bronze_dur: "12 meses",
    silver_dur: "26 meses",
    gold_dur: "36 meses",
    week: "Sem",
    total_balance: "Cartera Proyectada",
    tooltip_month_prefix: "Composición en el pico del ciclo:",
    extreme_bullish: "Extreme Bullish",
    steady_growth: "Crecimiento Estable",
    conservative: "Conservador",
    sentiment_hint: "Impulsado por el crecimiento de holders"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('pt');
  const t = translations[lang];

  const [state, setState] = useState<SimulationState>({
    investmentUsd: 2431000,
    tokenQuantity: 442000000,
    tokenPrice: 0.0055,
    lockTier: 'gold',
    marketOptimism: 22.5,
    newRoudersPerMonth: 450,
    ticketPerRouder: 2500
  });

  const [debouncedTimeline, setDebouncedTimeline] = useState<any[]>([]);

  const formatNumber = (val: number, decimals: number = 0) => {
    if (isNaN(val) || val === null) return "0";
    return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const handleQuantityChange = (q: number) => {
    const val = isNaN(q) ? 0 : q;
    setState(s => {
      const newV = Math.round(val * s.tokenPrice);
      return { ...s, tokenQuantity: val, investmentUsd: newV };
    });
  };

  const handlePriceChange = (p: number) => {
    const val = isNaN(p) ? 0 : p;
    setState(s => {
      const newV = Math.round(s.tokenQuantity * val);
      return { ...s, tokenPrice: val, investmentUsd: newV };
    });
  };

  const handleInvestmentChange = (v: number) => {
    const val = isNaN(v) ? 0 : v;
    setState(s => {
      const newQ = s.tokenPrice > 0 ? Math.round(val / s.tokenPrice) : 0;
      return { ...s, investmentUsd: val, tokenQuantity: newQ };
    });
  };

  const handleCommunityGrowthChange = (g: number) => {
    const growth = isNaN(g) ? 0 : g;
    const newSentiment = (growth / 2000) * 100;
    setState(s => ({
      ...s,
      newRoudersPerMonth: growth,
      marketOptimism: newSentiment
    }));
  };

  const results = useMemo(() => calculateIncentives(state), [state]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTimeline(results.timeline);
    }, 150);
    return () => clearTimeout(handler);
  }, [results.timeline]);

  const tierResults = useMemo(() => {
    return {
      bronze: calculateIncentives({ ...state, lockTier: 'bronze' }),
      silver: calculateIncentives({ ...state, lockTier: 'silver' }),
      gold: calculateIncentives({ ...state, lockTier: 'gold' }),
    };
  }, [state]);

  const flags: Record<Language, string> = {
    pt: "https://flagcdn.com/w160/br.png",
    en: "https://flagcdn.com/w160/us.png",
    es: "https://flagcdn.com/w160/es.png"
  };

  const isAggressive = state.marketOptimism > 70;

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10 transition-all duration-1000 ${isAggressive ? 'aggressive-mode' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#bc00ff] to-[#00f2ff] flex items-center justify-center shadow-xl shadow-purple-500/20 pulse-glow overflow-hidden p-1">
              <img src="https://i.ibb.co/GvXMNKym/image.png" alt="Jim Simions Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
              Jim <span className="text-gradient-cyan">Simions</span>
            </h1>
          </div>
          <p className="text-gray-400 font-bold text-[10px] md:text-sm ml-1 md:ml-15 uppercase tracking-widest opacity-80">
            {t.header_subtitle}
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex gap-3 glass p-1.5 rounded-xl border-white/5 shadow-2xl self-start md:self-auto">
            {(['pt', 'en', 'es'] as Language[]).map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`w-10 h-7 md:w-12 md:h-8 rounded-lg transition-all overflow-hidden border ${lang === l ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'border-transparent opacity-30 grayscale hover:opacity-100'}`}
              >
                <img src={flags[l]} alt={l} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 contain-paint">
        <MetricCard label={t.total_investment_power} value={state.investmentUsd} type="currency" glow="white" sub={`$ ${formatNumber(state.investmentUsd)}`} />
        <MetricCard label={t.estimated_profit_power} value={results.totalFutureValue} type="currency" glow="green" sub={`$ ${formatNumber(results.totalFutureValue)}`} />
        <MetricCard label={t.net_profit_power} value={results.totalFutureValue - state.investmentUsd} type="currency" glow="green" sub={`$ ${formatNumber(results.totalFutureValue - state.investmentUsd)}`} />
        <MetricCard label={t.potential_roi_power} value={results.totalFutureValue / Math.max(state.investmentUsd, 1)} type="multiplier" glow="cyan" sub={`${results.totalRoiPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}% ROI Total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className={`glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6 md:space-y-8 shadow-2xl border transition-all duration-700 ${isAggressive ? 'border-yellow-500/30' : 'border-white/5'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                <span className="text-cyan-400">🎯</span> {t.params_title}
              </h2>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            
            <div className="space-y-6">
              {/* 1. Quantidade de Tokens */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-cyan-400/30 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.token_quantity}</label>
                  <span className="text-[10px] text-gray-600 font-mono">Q</span>
                </div>
                <input 
                  type="number"
                  inputMode="numeric"
                  value={state.tokenQuantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="bg-transparent font-mono text-xl font-black text-white focus:outline-none w-full"
                />
                <div className="text-[11px] md:text-[13px] font-black font-mono text-white/70 tracking-widest mt-2 bg-white/5 p-2 rounded-lg border border-white/5 shadow-inner">
                  {formatNumber(state.tokenQuantity)}
                </div>
              </div>

              {/* 2. Sentimento de Mercado (Embaixo da Quantidade de Tokens) */}
              <div className="space-y-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.market_sentiment}</label>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase transition-all duration-500 ${state.marketOptimism > 70 ? 'bg-orange-500/20 text-orange-400' : state.marketOptimism < 30 ? 'bg-white/10 text-gray-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    {state.marketOptimism > 70 ? t.extreme_bullish : state.marketOptimism < 30 ? t.conservative : t.steady_growth}
                  </span>
                </div>
                
                <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${state.marketOptimism > 70 ? 'bg-orange-500' : 'bg-cyan-400'}`}
                    style={{ width: `${state.marketOptimism}%` }}
                  />
                </div>
                
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic text-right opacity-60">
                   {t.sentiment_hint} • {state.marketOptimism.toFixed(1)}%
                </p>
              </div>

              {/* 3. Preço de Entrada */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-cyan-400/30 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.token_price}</label>
                  <span className="text-[10px] text-gray-600 font-mono">P</span>
                </div>
                <input 
                  type="number" step="0.0001"
                  inputMode="decimal"
                  value={state.tokenPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="bg-transparent font-mono text-xl font-black text-white focus:outline-none w-full"
                />
                <div className="text-[11px] md:text-[13px] font-black font-mono text-white/70 tracking-widest mt-2 bg-white/5 p-2 rounded-lg border border-white/5 shadow-inner">
                  $ {formatNumber(state.tokenPrice, 4)}
                </div>
              </div>

              {/* 4. Motor de Comunidade */}
              <div className="space-y-5 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <label className="text-[10px] font-black text-white uppercase tracking-widest">{t.community_dynamics}</label>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>{t.new_rouders}</span>
                    <span className="text-orange-400 font-mono">{state.newRoudersPerMonth}</span>
                  </div>
                  <input type="range" min="0" max="2000" step="50" value={state.newRoudersPerMonth} onChange={(e) => handleCommunityGrowthChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-full appearance-none accent-orange-500" />
                </div>
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{t.avg_ticket}</span>
                  {/* Adicionado pr-6 para dar espaço aos controles nativos do input type number */}
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    value={state.ticketPerRouder} 
                    onChange={(e) => setState(s => ({...s, ticketPerRouder: Number(e.target.value)}))} 
                    className="bg-transparent text-right font-mono text-xs font-bold text-white w-24 pr-4 focus:outline-none" 
                  />
                </div>
              </div>

              {/* 5. Capital em Operação */}
              <div className="p-6 rounded-2xl md:rounded-3xl bg-white/10 border border-cyan-400/40 group hover:border-cyan-400/60 transition-all shadow-2xl shadow-cyan-400/10 md:scale-[1.02]">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] md:text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em]">{t.total_investment}</label>
                  <span className="text-[10px] text-cyan-700 font-mono italic">V = Q x P</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input 
                      type="number"
                      inputMode="numeric"
                      value={state.investmentUsd}
                      onChange={(e) => handleInvestmentChange(Number(e.target.value))}
                      className="bg-transparent font-mono text-2xl md:text-3xl font-black text-cyan-400 focus:outline-none w-full border-b-2 border-cyan-400/20 pb-1"
                    />
                    <div className="text-[14px] md:text-[18px] font-black font-mono text-cyan-400 tracking-tighter py-2 px-3 bg-cyan-900/30 rounded-xl border border-cyan-400/20 flex justify-between">
                      <span>$ {formatNumber(state.investmentUsd)}</span>
                      <span className="text-[8px] md:text-[10px] text-cyan-500/50 uppercase">Allocated Cap</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="range" 
                      min="1000" 
                      max="10000000" 
                      step="10000"
                      value={state.investmentUsd}
                      onChange={(e) => handleInvestmentChange(Number(e.target.value))}
                      className="w-full h-2 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full cta-glow py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl pulse-glow group relative overflow-hidden transition-all active:scale-95">
              <span className="relative z-10 font-black">{t.cta_future}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-4 md:space-y-6 order-1 lg:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
             <TierSelector active={state.lockTier === 'bronze'} onClick={() => setState(s => ({...s, lockTier: 'bronze'}))} label={t.bronze} duration={t.bronze_dur} yieldPct={`${tierResults.bronze.totalRoiPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}%`} color="from-orange-500/20" />
             <TierSelector active={state.lockTier === 'silver'} onClick={() => setState(s => ({...s, lockTier: 'silver'}))} label={t.silver} duration={t.silver_dur} yieldPct={`${tierResults.silver.totalRoiPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}%`} color="from-slate-400/20" />
             <TierSelector active={state.lockTier === 'gold'} onClick={() => setState(s => ({...s, lockTier: 'gold'}))} label={t.gold} duration={t.gold_dur} yieldPct={`${tierResults.gold.totalRoiPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}%`} color="from-yellow-400/20" />
          </div>

          <div className="glass p-3 md:p-8 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-8 px-2 md:px-0 relative z-10">
              <div className="space-y-1">
                <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic">{t.growth_chart_title}</h3>
                <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">{t.growth_chart_sub}</p>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 bg-black/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
                 <LegendItem color="#bc00ff" label={t.principal_value_label} />
                 <LegendItem color="#00f2ff" label={t.yield_value_label} />
                 <LegendItem color="#00ff00" label={t.token_price_label} />
                 <LegendItem color="#f97316" label={t.community_label} dashed />
              </div>
            </div>

            <div className="h-[260px] sm:h-[380px] md:h-[480px] w-full relative z-10 contain-layout">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={debouncedTimeline} margin={{ top: 10, right: -15, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bc00ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#bc00ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#555" 
                    fontSize={8} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(w) => w % 52 === 0 ? `Y${w/52}` : ''} 
                    dy={5} 
                    minTickGap={20}
                  />
                  
                  <YAxis 
                    yAxisId="left" 
                    stroke="#555" 
                    fontSize={8} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} 
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={7} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="priceAxis" orientation="right" hide />

                  <Tooltip content={<ChartTooltip t={t} lang={lang} />} cursor={{ stroke: '#ffffff22', strokeWidth: 1 }} />
                  
                  <Area yAxisId="left" isAnimationActive={false} type="monotone" dataKey="principalValue" stackId="1" stroke="#bc00ff" strokeWidth={2} fill="url(#purpleGrad)" />
                  <Area yAxisId="left" isAnimationActive={false} type="monotone" dataKey="yieldValue" stackId="1" stroke="#00f2ff" strokeWidth={2} fill="url(#cyanGrad)" />
                  
                  <Line yAxisId="priceAxis" isAnimationActive={false} type="monotone" dataKey="tokenPrice" stroke="#00ff00" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                  <Line yAxisId="right" isAnimationActive={false} type="monotone" dataKey="communityCount" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full">
            <div className="glass p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-white/5 space-y-6 md:space-y-8 contain-layout">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.capital_allocation}</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                 <AllocationBar label={t.initial_capital} value={results.principalValueInitial} total={results.totalFutureValue} color="bg-white/20" formatter={formatNumber} />
                 <AllocationBar label={t.price_gain} value={results.appreciationGain} total={results.totalFutureValue} color="bg-purple-500 shadow-[0_0_15px_rgba(188,0,255,0.4)]" formatter={formatNumber} />
                 <AllocationBar label={t.yield_gain} value={results.yieldGain} total={results.totalFutureValue} color="bg-cyan-500 shadow-[0_0_20px_rgba(0,242,255,0.4)]" formatter={formatNumber} />
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, type, glow, sub }: any) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const start = prevValue.current;
    const duration = 600; 
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (value - start) * ease;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        rafId.current = requestAnimationFrame(update);
      } else {
        prevValue.current = value;
      }
    };
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(update);
    
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [value]);

  const colors: any = {
    white: 'border-b-white/20 text-white',
    green: 'border-b-[#10b981]/50 text-[#10b981] shadow-[#10b981]/10',
    cyan: 'border-b-cyan-500/50 text-cyan-400 shadow-cyan-500/10'
  };

  const formattedVal = type === 'multiplier' 
    ? `${displayValue.toFixed(2)}x`
    : `$${new Intl.NumberFormat().format(Math.round(displayValue))}`;

  return (
    <div className={`glass p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-b-4 transition-transform hover:-translate-y-1 shadow-2xl flex flex-col justify-between ${colors[glow]} will-change-transform`}>
      <div className="overflow-hidden">
        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-2 md:mb-4 opacity-70">{label}</p>
        <h4 className="text-xl md:text-3xl font-mono font-black tracking-tighter truncate">
          {formattedVal}
        </h4>
      </div>
      <p className="text-[8px] md:text-[9px] text-gray-500 font-black mt-3 md:mt-4 uppercase tracking-tighter opacity-70 border-t border-white/5 pt-2">{sub}</p>
    </div>
  );
};

const TierSelector = ({ active, onClick, label, duration, yieldPct, color }: any) => (
  <button onClick={onClick} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between group overflow-hidden relative ${active ? 'bg-white/10 border-white/30 shadow-2xl scale-[1.02] z-10' : 'bg-transparent border-white/5 opacity-40 hover:opacity-100'} will-change-transform`}>
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20`} />
    <div className="relative z-10 flex flex-col items-start">
      <h5 className="font-black text-[9px] md:text-[10px] text-white uppercase italic tracking-tighter">{label}</h5>
      <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-wider">{duration}</span>
    </div>
    <div className="relative z-10 text-right">
      <div className="text-lg md:text-xl font-mono font-black text-gradient-cyan">{yieldPct}</div>
    </div>
    {active && <div className="absolute right-0 top-0 w-1 h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,242,255,1)]" />}
  </button>
);

const AllocationBar = ({ label, value, total, color, formatter }: any) => {
  const percentage = total > 0 ? (value/total)*100 : 0;
  return (
    <div className="space-y-1 md:space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
          <span className="text-[8px] md:text-[9px] font-mono text-gray-500 font-bold">$ {formatter(value)}</span>
        </div>
        <span className="text-[10px] md:text-xs font-mono font-bold text-white">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-black/40 h-2.5 md:h-3 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
        <div className={`${color} h-full rounded-full transition-all duration-700 will-change-[width]`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, dashed }: any) => (
  <div className="flex items-center gap-1.5 md:gap-2">
    <div className="w-2.5 h-0.5" style={dashed ? {borderTop: `1.5px dashed ${color}`, background: 'transparent'} : {backgroundColor: color}} />
    <span className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
  </div>
);

const ChartTooltip = ({ active, payload, label, t, lang }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const format = (v: number) => new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
    const formatSmall = (v: number) => new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(v);
    
    return (
      <div className="glass p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-white/20 shadow-2xl space-y-3 md:space-y-5 min-w-[180px] md:min-w-[280px] max-w-[90vw]">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 md:pb-3">
          <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.week} {label}</span>
          <span className="text-[8px] md:text-[10px] font-black text-cyan-400 px-2 py-1 rounded bg-cyan-400/10 uppercase italic">{t.total_balance}</span>
        </div>
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-center text-[9px] md:text-[10px]">
             <span className="font-black text-gray-500 uppercase">{t.principal_value_label}</span>
             <span className="font-mono font-bold text-white">{format(data.principalValue)}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] md:text-[10px]">
             <span className="font-black text-cyan-400 uppercase">{t.yield_value_label}</span>
             <span className="font-mono font-bold text-cyan-400">+{format(data.yieldValue)}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] md:text-[10px] bg-green-500/10 p-1.5 md:p-2 rounded-xl border border-green-500/20">
             <span className="font-black text-green-400 uppercase">{t.token_price_label}</span>
             <span className="font-mono font-bold text-green-400">{formatSmall(data.tokenPrice)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-2 md:pt-3 text-[9px] md:text-[10px]">
             <span className="font-black text-orange-500 uppercase">{t.community_label}</span>
             <span className="font-mono font-bold text-orange-400">{Math.floor(data.communityCount).toLocaleString()} holders</span>
          </div>
        </div>
        <p className="text-[8px] md:text-[9px] text-gray-500 italic text-center opacity-60 uppercase font-black tracking-widest leading-tight">{t.tooltip_month_prefix}</p>
        <p className="text-base md:text-xl font-mono font-black text-white text-center">{format(data.totalValue)}</p>
      </div>
    );
  }
  return null;
};

export default App;
