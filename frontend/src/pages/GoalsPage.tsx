import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Trophy, 
  Target, 
  Plus, 
  Flag,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

type FinancialGoal = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progressPercentage: number;
  requiredMonthlySavings: number;
  estimatedCompletionDate: string | null;
};

const GoalsPage = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editGoalId, setEditGoalId] = useState<number | null>(null);
  
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get<FinancialGoal[]>("/goals");
      setGoals(res.data);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (g: FinancialGoal) => {
    setTitle(g.title);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setDeadline(g.deadline);
    setEditGoalId(g.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadline) return;
    
    setSubmitting(true);
    try {
      const payload = {
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || "0"),
        deadline
      };

      if (editGoalId) {
        await api.put(`/goals/${editGoalId}`, payload);
        toast.success("Milestone updated");
      } else {
        await api.post("/goals", payload);
        toast.success("New goal established");
      }
      
      setShowForm(false);
      resetForm();
      loadGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save goal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success("Goal removed");
      loadGoals();
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setEditGoalId(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Future Milestones
            </h1>
            <PremiumBadge color="amber">
              <Trophy size={12} className="mr-1" />
              {goals.filter(g => g.progressPercentage >= 100).length} Won
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            Define, track, and conquer your long-term financial objectives.
          </p>
        </div>

        <PremiumButton 
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="shadow-xl shadow-primary-500/30"
        >
          <Plus size={18} strokeWidth={3} />
          New Milestone
        </PremiumButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-[32px] p-10 shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-textHeadings dark:text-white uppercase">
                    {editGoalId ? "Target Adjustment" : "Establish Target"}
                  </h2>
                  <p className="text-xs font-bold text-textSecondary dark:text-slate-400 mt-1 uppercase tracking-widest">Architect your financial future</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-textMuted hover:text-textPrimary transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Goal Designation</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold placeholder:text-textMuted outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                    placeholder="e.g. Retirement Reserve, Dream Estate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Victory Point (Target)</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Initial Input</label>
                    <input
                      type="number"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Target Horizon (Date)</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none transition-all"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                   <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 rounded-[20px] bg-gray-50 dark:bg-white/5 text-textSecondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/10"
                  >
                    Discard
                  </button>
                  <PremiumButton type="submit" className="flex-[1.5] !rounded-[20px] !bg-gradient-to-r from-amber-500 to-orange-600">
                    {submitting ? "Processing..." : editGoalId ? "Seal Adjustments" : "Initialize Goal"}
                  </PremiumButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-[24px] bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <PremiumCard variant="white" className="py-24 text-center flex flex-col items-center">
            <div className="h-24 w-24 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
              <Flag size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-textHeadings dark:text-white uppercase tracking-tight">No Horizons Defined</h3>
            <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2 max-w-sm">
                Architect your first financial milestone to start your victory march.
            </p>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {goals.map((goal, idx) => {
            const isCompleted = goal.progressPercentage >= 100;

            return (
              <PremiumCard
                key={goal.id}
                delayIndex={idx}
                variant={isCompleted ? 'emerald' : 'white'}
                className={`relative group overflow-hidden ${isCompleted ? 'border-none shadow-emerald-500/20' : ''}`}
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                   {isCompleted ? <Trophy size={120} strokeWidth={1} /> : <Target size={120} strokeWidth={1} />}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border ${
                    isCompleted 
                      ? 'bg-white/20 text-white border-white/20' 
                      : 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-500/20'
                  }`}>
                    {isCompleted ? <Sparkles size={24} /> : <Flag size={24} />}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(goal)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-50 hover:bg-gray-100 text-textMuted dark:bg-white/5'
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-white/10 hover:bg-rose-500/30 text-white' : 'bg-gray-50 hover:bg-rose-50 text-textMuted dark:bg-white/5'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-xl font-black uppercase tracking-tight truncate ${isCompleted ? 'text-white' : 'text-textHeadings dark:text-white'}`}>
                    {goal.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={12} className={isCompleted ? 'text-white/60' : 'text-textMuted'} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-white/60' : 'text-textMuted'}`}>
                      By {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 ${isCompleted ? 'text-white/60' : 'text-textMuted'}`}>Current Velocity</p>
                      <div className={`text-2xl font-black tracking-tight ${isCompleted ? 'text-white' : 'text-textHeadings dark:text-white'}`}>
                        ₹<AnimatedCounter value={goal.currentAmount} decimals={0} />
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 ${isCompleted ? 'text-white/60' : 'text-textMuted'}`}>Victory Point</p>
                       <div className={`text-lg font-bold opacity-80 ${isCompleted ? 'text-white' : 'text-textSecondary dark:text-slate-300'}`}>
                        ₹<AnimatedCounter value={goal.targetAmount} decimals={0} />
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className={`w-full rounded-full h-2.5 shadow-inner overflow-hidden ${isCompleted ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/5'}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progressPercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                      />
                    </div>
                    <div className={`text-right mt-2 text-[10px] font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>
                      {goal.progressPercentage.toFixed(0)}% Achieved
                    </div>
                  </div>

                  {!isCompleted && (
                    <div className="mt-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center group/panel hover:border-amber-500/30 transition-all">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted mb-2">Monthly Supply Required</p>
                       <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                          <TrendingUp size={14} />
                          <span className="text-lg font-black tracking-tight">₹{goal.requiredMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                       </div>
                    </div>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
