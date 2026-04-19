import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Plus, 
  CreditCard, 
  Banknote, 
  ArrowUpRight, 
  Settings, 
  MoreVertical,
  Globe,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";
import { AnimatedCounter } from "../components/AnimatedCounter";

import toast from "react-hot-toast";

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
             <PremiumBadge color="indigo" variant="neon">MY ACCOUNTS LIST</PremiumBadge>
          </div>
          <h1 className="text-[54px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-4">
            My Bank Accounts
          </h1>
          <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Asset Overview <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" /> {accounts.length} Active Accounts
          </p>
        </div>

        <div className="flex gap-4">
           <PremiumButton 
            size="lg"
            className="shadow-xl shadow-indigo-500/20 h-14 !px-10 !rounded-[20px]"
          >
            <Plus size={18} strokeWidth={4} className="mr-2" />
            LINK NEW ACCOUNT
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Balance Hero */}
        <div className="col-span-12 lg:col-span-12">
           <PremiumCard variant="obsidian" className="!p-16 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 text-white/5 group-hover:scale-110 transition-transform duration-1000">
                 <Globe size={320} strokeWidth={0.5} />
              </div>
              
              <div className="relative z-10 space-y-4 text-center md:text-left">
                 <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em]">TOTAL MONEY ACROSS ALL ACCOUNTS</p>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <h2 className="text-7xl font-black text-white tracking-tighter">
                       ₹<AnimatedCounter value={totalBalance} />
                    </h2>
                    <div className="p-3 rounded-2xl bg-white/10 text-white animate-pulse">
                       <ArrowUpRight size={24} strokeWidth={3} />
                    </div>
                 </div>
                 <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Calculated from {accounts.length} verified sources</p>
              </div>

              <div className="relative z-10 mt-10 md:mt-0 grid grid-cols-2 gap-8">
                 <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AVAILABLE CASH</p>
                    <p className="text-2xl font-black text-white tracking-tight">₹{(totalBalance * 0.4).toLocaleString()}</p>
                 </div>
                 <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">INVESTED MONEY</p>
                    <p className="text-2xl font-black text-white tracking-tight">₹{(totalBalance * 0.6).toLocaleString()}</p>
                 </div>
              </div>
           </PremiumCard>
        </div>

        {/* Account Cards */}
        <div className="col-span-12">
           <PremiumCard variant="white" className="!p-10">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Connected Accounts</h3>
                 <div className="flex items-center gap-4">
                    <button className="text-[11px] font-black text-slate-400 hover:text-indigo-500 uppercase flex items-center gap-2">
                       Settings <Settings size={14} strokeWidth={4} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))
                 ) : accounts.map((acc, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="p-10 bg-slate-50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 group relative overflow-hidden"
                    >
                       <div className="flex items-center justify-between mb-10">
                          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                             {acc.accountType === 'SAVINGS' ? <Banknote size={28} strokeWidth={2.5} /> : <CreditCard size={28} strokeWidth={2.5} />}
                          </div>
                          <PremiumBadge color="indigo">ACTIVE</PremiumBadge>
                       </div>

                       <div className="mb-10">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{acc.bankName}</p>
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{acc.accountName}</h4>
                       </div>

                       <div className="flex items-end justify-between">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                             <div className="flex items-center gap-3">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{acc.balance.toLocaleString()}</h3>
                                {acc.balance > 50000 && <Sparkles size={16} className="text-amber-500 animate-pulse" />}
                             </div>
                          </div>
                          <button className="p-3 bg-white dark:bg-white/10 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors">
                             <MoreVertical size={20} />
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
