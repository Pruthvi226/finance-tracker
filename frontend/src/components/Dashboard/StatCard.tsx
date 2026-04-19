import type { ReactNode } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
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

  // Map accents to PremiumCard variants
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

  return (
    <PremiumCard
      variant={variantMap[accent]}
      delayIndex={delayIndex}
      className="col-span-12 sm:col-span-6 lg:col-span-3 !p-0 overflow-hidden min-h-[180px] group flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-[16px] transition-all duration-500 group-hover:scale-110 shadow-sm ${
            accent === 'sky' 
              ? 'bg-white/20 backdrop-blur-md text-white border border-white/20' 
              : 'bg-white dark:bg-white/5 text-primary-600 dark:text-primary-400 border border-gray-100 dark:border-white/10'
          }`}>
            {icon}
          </div>
          
          {showDelta && !loading && (
            <PremiumBadge 
              color={badgeColorMap[deltaDir]} 
              pulse={deltaDir === (accent === 'rose' ? 'up' : 'down')}
            >
              {deltaDir === "up" ? <TrendingUp size={12} /> : deltaDir === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
              {deltaText}
            </PremiumBadge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
            accent === 'sky' ? 'text-white/80' : 'text-textMuted dark:text-slate-400'
          }`}>
            {title}
          </p>
          <h3 className={`text-[28px] font-black tracking-tight ${
            accent === 'sky' ? 'text-white' : 'text-textHeadings dark:text-white'
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

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-[60px] w-full mt-auto opacity-40 group-hover:opacity-100 transition-opacity duration-700">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={accent === 'sky' ? '#ffffff' : '#6366F1'} 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PremiumCard>
  );
};
