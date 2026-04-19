import type { ReactNode } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { AnimatedCounter } from "../AnimatedCounter";
import { PremiumCard } from "../ui/PremiumCard";
import { PremiumBadge } from "../ui/PremiumBadge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  accent: "emerald" | "rose" | "indigo" | "sky" | "amber" | "cyan" | "blue";
  delta?: number | null;
  loading?: boolean;
  delayIndex?: number;
  sparklineData?: { value: number }[];
};

export const StatCard = ({ title, value, icon, accent, delta, loading = false, delayIndex = 0, sparklineData }: StatCardProps) => {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const deltaDir = showDelta ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "flat";
  const deltaText = showDelta ? `${Math.abs(delta).toFixed(1)}%` : "";

  const variantMap: Record<string, any> = {
    sky: 'gradient',
    emerald: 'emerald',
    rose: 'rose',
    amber: 'amber',
    indigo: 'indigo',
    cyan: 'cyan',
    blue: 'blue',
  };

  const badgeColorMap: Record<string, any> = {
    up: 'emerald',
    down: 'rose',
    flat: 'gray',
  };

  const accentColor: Record<string, string> = {
    sky: '#ffffff',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    indigo: '#6366f1',
  };

  return (
    <PremiumCard
      variant={variantMap[accent]}
      delayIndex={delayIndex}
      className={`col-span-12 sm:col-span-6 lg:col-span-3 !p-0 overflow-hidden min-h-[160px] group flex flex-col ${accent === 'sky' ? 'border-none' : ''}`}
      glow={accent === 'sky'}
    >
      <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-xl transition-all duration-500 group-hover:scale-110 shadow-sm ${
            accent === 'sky' 
              ? 'bg-white/20 backdrop-blur-md text-white border border-white/20' 
              : 'bg-slate-100 dark:bg-white/5 text-slate-500'
          }`}>
            {icon}
          </div>
          
          {showDelta && !loading && (
            <PremiumBadge 
              color={badgeColorMap[deltaDir]} 
              pulse={deltaDir === (accent === 'rose' ? 'up' : 'down')}
              variant="neon"
            >
              {deltaDir === "up" ? <TrendingUp size={10} strokeWidth={3} /> : deltaDir === "down" ? <TrendingDown size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />}
              {deltaText}
            </PremiumBadge>
          )}
        </div>

        <div className="flex flex-col">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
            accent === 'sky' ? 'text-white/70' : 'text-slate-500'
          }`}>
            {title}
          </p>
          <h3 className={`text-[24px] font-black tracking-tighter leading-none ${
            accent === 'sky' ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}>
            {loading ? "---" : (() => {
                const match = value.match(/^([^0-9.-]*)([0-9,.-]+)([^0-9.-]*)$/);
                if (match) {
                  const prefix = match[1];
                  const numStr = match[2].replace(/,/g, '');
                  const suffix = match[3];
                  const num = parseFloat(numStr);
                  
                  if (!isNaN(num)) {
                    return <AnimatedCounter value={num} prefix={prefix} suffix={suffix} decimals={num % 1 !== 0 ? 2 : 0} />;
                  }
                }
                return value;
              })()}
          </h3>
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-[50px] w-full mt-auto opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                 <linearGradient id={`grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor[accent]} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={accentColor[accent]} stopOpacity={0}/>
                 </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={accentColor[accent]} 
                strokeWidth={3} 
                fill={`url(#grad-${accent})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </PremiumCard>
  );
};
