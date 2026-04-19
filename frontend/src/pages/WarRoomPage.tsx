import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Radio, 
  Crosshair,
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { useSovereign } from "../hooks/useSovereign";

type ExposureData = {
  fixedCosts: number;
  variableVelocity: number;
  liquidFuel: number;
  riskMagnitude: number;
  unificationScore: number;
};

const ExposureRadar = ({ data }: { data: ExposureData }) => {
  const { persona } = useSovereign();
  
  // Calculate relative sizes for the radar segments
  const total = data.fixedCosts + data.variableVelocity + data.liquidFuel;

  return (
    <div className="relative h-[400px] w-[400px] flex items-center justify-center">
      {/* Background Rings */}
      {[1, 2, 3, 4].map(i => (
        <div 
          key={i}
          className="absolute rounded-full border border-slate-200 dark:border-white/5"
          style={{ 
            width: `${i * 25}%`, 
            height: `${i * 25}%`,
            opacity: 1.25 - (i * 0.25)
          }}
        />
      ))}
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent to-indigo-500 origin-left z-10"
      />

      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl overflow-visible">
        {/* Fixed Costs Segment */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: data.fixedCosts / total }}
          transition={{ duration: 2, ease: "circOut" }}
          cx="50" cy="50" r="40"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="12"
          strokeDasharray="251.2"
          className="opacity-80"
        />
        {/* Variable Velocity Segment */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: data.variableVelocity / total }}
          transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
          cx="50" cy="50" r="40"
          fill="none"
          stroke="#6366f1"
          strokeWidth="12"
          strokeDashoffset={-251.2 * (data.fixedCosts / total)}
          strokeDasharray="251.2"
          className="opacity-80"
        />
        {/* Liquid Fuel Segment */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: data.liquidFuel / total }}
          transition={{ duration: 2, delay: 1, ease: "circOut" }}
          cx="50" cy="50" r="40"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeDashoffset={-251.2 * ((data.fixedCosts + data.variableVelocity) / total)}
          strokeDasharray="251.2"
          className="opacity-80"
        />
      </svg>

      {/* Center Persona Core */}
      <div className="absolute inset-0 flex items-center justify-center">
         <div 
           className="h-24 w-24 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
           style={{ borderColor: persona.color + '44' }}
         >
            <div className="text-center">
               <p className="text-[10px] font-black uppercase text-slate-500 mb-1">HEALTH</p>
               <h2 className="text-2xl font-black text-white leading-none">{data.unificationScore}</h2>
            </div>
         </div>
      </div>
    </div>
  );
};

import toast from "react-hot-toast";

const WarRoomPage = () => {
  const [data, setData] = useState<ExposureData | null>(null);
  const [loading, setLoading] = useState(true);
  useSovereign();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const analyticsRes = await api.get('/analytics');
        const healthRes = await api.get('/ai/health-score');
        
        const monthlyExp = Object.values((analyticsRes.data as any).monthlyExpenses || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
        const monthlyInc = Object.values((analyticsRes.data as any).monthlyIncome || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
        
        setData({
          fixedCosts: monthlyExp * 0.4,
          variableVelocity: monthlyExp * 0.6,
          liquidFuel: Math.max(0, monthlyInc - monthlyExp),
          riskMagnitude: (monthlyExp / (monthlyInc || 1)) * 100,
          unificationScore: (healthRes.data as any).score || 0
        });
      } catch (err: any) {
        toast.error(err.message || "Financial security scan failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-rose-500 rounded-full" />
             <PremiumBadge color="rose" variant="neon">FINANCIAL ANALYSIS</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            Security Health
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Spending Analysis <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> Live Report
          </p>
        </div>

        <div className="p-1 px-1.5 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
           <div className="flex items-center gap-2 p-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SYSTEM SECURE</span>
           </div>
           <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/5" />
           <button className="px-6 py-3 bg-white dark:bg-white/10 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white shadow-sm">
             Refresh Scan
           </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] rounded-[48px] bg-slate-100 dark:bg-white/5 animate-pulse flex items-center justify-center">
           <Radio size={64} className="text-slate-300 animate-bounce" />
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Radar Section */}
           <PremiumCard variant="obsidian" className="lg:col-span-8 !p-0 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center group shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
              <div className="absolute top-0 w-full p-10 flex justify-between items-start z-10">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Spending Breakdown</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">All Sectors: Normal</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-6 bg-rose-500 rounded-full" />
                       <span className="text-[9px] font-black uppercase text-slate-400">Regular Bills</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-6 bg-indigo-500 rounded-full" />
                       <span className="text-[9px] font-black uppercase text-slate-400">Recent Spending</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-6 bg-emerald-500 rounded-full" />
                       <span className="text-[9px] font-black uppercase text-slate-400">Cash Left</span>
                    </div>
                 </div>
              </div>

              <div className="relative group-hover:scale-110 transition-transform duration-1000 ease-out">
                 <ExposureRadar data={data} />
              </div>

              <div className="absolute bottom-0 w-full p-10 grid grid-cols-3 gap-8 z-10 border-t border-white/5 bg-black/20 backdrop-blur-md">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Fixed Bills</p>
                    <p className="text-2xl font-black text-rose-500 tracking-tighter">₹{Math.round(data.fixedCosts).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Recent Activity</p>
                    <p className="text-2xl font-black text-indigo-500 tracking-tighter">₹{Math.round(data.variableVelocity).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Available Cash</p>
                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">₹{Math.round(data.liquidFuel).toLocaleString()}</p>
                 </div>
              </div>
           </PremiumCard>

           {/* Stats Column */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              <PremiumCard variant="white" className="flex-1 !p-8 flex flex-col justify-between group">
                 <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 group-hover:rotate-12 transition-transform shadow-inner">
                       <ShieldAlert size={24} strokeWidth={2.5} />
                    </div>
                    <PremiumBadge color="rose" variant="neon">ALERT</PremiumBadge>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">RISK SCORE</p>
                    <div className="flex items-end gap-3">
                       <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(data.riskMagnitude)}%</h3>
                       <p className="text-[12px] font-black text-rose-500 mb-2 uppercase tracking-widest flex items-center">
                         High Risk
                       </p>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic">
                      "Your spending is getting close to your total income."
                    </p>
                 </div>
              </PremiumCard>

              <PremiumCard variant="white" className="flex-1 !p-8 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:-rotate-12 transition-transform shadow-inner">
                       <Crosshair size={24} strokeWidth={2.5} />
                    </div>
                    <PremiumBadge color="indigo">SCORE</PremiumBadge>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">OVERALL PROGRESS</p>
                    <div className="flex items-end gap-3">
                       <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{(data.unificationScore / 10).toFixed(1)}</h3>
                       <p className="text-[12px] font-black text-indigo-500 mb-2 uppercase tracking-widest">/ 10</p>
                    </div>
                 </div>
                 <div className="mt-8 flex gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full ${i <= data.unificationScore / 10 ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-100 dark:bg-white/5'}`} 
                      />
                    ))}
                 </div>
              </PremiumCard>
           </div>
        </div>
      )}
    </div>
  );
};

export default WarRoomPage;
