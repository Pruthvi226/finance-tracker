import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import SavingsIcon from '@mui/icons-material/Savings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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
        toast.success("Goal updated");
      } else {
        await api.post("/goals", payload);
        toast.success("Goal created");
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
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success("Goal deleted");
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

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 glass-card"></div>
          <div className="h-64 glass-card"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 text-textHeadings dark:text-slate-100 uppercase tracking-tight">
            <span className="text-primary-600"><EmojiEventsIcon fontSize="large"/></span> Financial Goals
          </h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">Architect your future milestones</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary py-2 px-4 shadow-lg shadow-primary-500/20"
        >
          <AddCircleOutlineIcon className="mr-2" fontSize="small" />
          New Goal
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-textPrimary dark:text-slate-100 mb-6 uppercase tracking-tight">{editGoalId ? "Update Goal" : "Create Goal"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Goal Title (e.g., Vacation)</label>
                <input
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dream Vacation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field font-bold"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="50000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Current Amount Saved</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field font-bold"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Target Deadline</label>
                <input
                  type="date"
                  className="input-field font-bold"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? "Saving..." : editGoalId ? "Update Goal" : "Create Goal"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-textMuted hover:text-textPrimary hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-border dark:border-white/5 shadow-sm">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
      {goals.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 text-textMuted border border-border dark:border-white/5 shadow-sm">
            <FlagIcon fontSize="large" />
          </div>
          <h3 className="text-xl font-black text-textPrimary dark:text-slate-100 uppercase tracking-tight">No active goals</h3>
          <p className="text-textMuted dark:text-slate-400 mt-2 font-bold max-w-sm mx-auto">Create your first financial goal to start tracking your savings journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.progressPercentage >= 100;
            return (
              <div key={goal.id} className="glass-card p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                {isCompleted && (
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-lg z-10 uppercase tracking-widest">
                    COMPLETED
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center border border-primary-100 dark:border-primary-500/20 shadow-sm transition-transform group-hover:scale-110 duration-500">
                    <SavingsIcon className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(goal)} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 text-textMuted hover:text-primary-600 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(goal.id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-textMuted hover:text-rose-600 transition-colors">Delete</button>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-textHeadings dark:text-white uppercase tracking-tight">{goal.title}</h3>
                <p className="text-[10px] text-textSecondary dark:text-slate-500 mb-6 font-black uppercase tracking-widest mt-1">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-end">
                    <div className="text-3xl font-black text-textHeadings dark:text-slate-100 tracking-tighter">
                      ₹{goal.currentAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black text-textSecondary dark:text-slate-500 uppercase tracking-widest">
                      OF ₹{goal.targetAmount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-3.5 border border-border dark:border-white/5 overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-primary-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]'}`}
                    ></motion.div>
                  </div>
                  <div className="text-right text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                    {goal.progressPercentage.toFixed(1)}% Completed
                  </div>
                </div>
                
                {!isCompleted && (
                  <div className="mt-4 pt-6 border-t border-border dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/30 rounded-xl p-4 border border-border dark:border-white/5 shadow-inner">
                      <span className="text-[10px] text-textMuted dark:text-slate-400 uppercase font-black tracking-widest">Required Monthly:</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        ₹{goal.requiredMonthlySavings.toLocaleString()}
                      </span>
                    </div>
                    
                    {goal.estimatedCompletionDate && (
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-textSecondary dark:text-slate-500 uppercase font-black tracking-widest">Estimated Finish:</span>
                        <span className="text-[10px] font-black text-textHeadings dark:text-slate-300 uppercase tracking-widest">
                          {new Date(goal.estimatedCompletionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default GoalsPage;
