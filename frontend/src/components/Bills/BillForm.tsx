import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, Clock } from 'lucide-react';
import { PremiumCard } from '../ui/PremiumCard';
import { PremiumButton } from '../ui/PremiumButton';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface BillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BillForm = ({ isOpen, onClose, onSuccess }: BillFormProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [recurrence, setRecurrence] = useState('MONTHLY');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/bills', {
        name,
        amount: parseFloat(amount),
        dueDate,
        category,
        recurrence,
        status: 'UNPAID'
      });
      if (res.data.success) {
        toast.success('Bill registered in Liability Nexus');
        onSuccess();
        onClose();
        // Reset form
        setName('');
        setAmount('');
        setDueDate('');
      }
    } catch (err) {
      toast.error('Failed to register bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
          >
            <PremiumCard variant="white" className="!p-8 overflow-visible">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-black text-textPrimary uppercase tracking-tight">Register Liability</h2>
                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">Add new monthly financial obligation</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                     <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-textMuted px-1">Bill Name</label>
                     <div className="relative">
                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                        <input 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/5 transition-all" 
                          placeholder="e.g. Electricity, AWS, Rent"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-textMuted px-1">Amount</label>
                        <div className="relative">
                           <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                           <input 
                             required
                             type="number"
                             step="0.01"
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/5 transition-all" 
                             placeholder="0.00"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-textMuted px-1">Due Date</label>
                        <div className="relative">
                           <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                           <input 
                             required
                             type="date"
                             value={dueDate}
                             onChange={(e) => setDueDate(e.target.value)}
                             className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-[12px] font-black outline-none focus:ring-4 focus:ring-primary-500/5 transition-all" 
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-textMuted px-1">Category</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3.5 text-[12px] font-black outline-none appearance-none cursor-pointer"
                        >
                           <option value="Utilities">Utilities</option>
                           <option value="Subscription">Subscription</option>
                           <option value="Housing">Housing</option>
                           <option value="Insurance">Insurance</option>
                           <option value="Taxes">Taxes</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-textMuted px-1">Recurrence</label>
                        <div className="relative">
                           <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                           <select 
                             value={recurrence}
                             onChange={(e) => setRecurrence(e.target.value)}
                             className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-[12px] font-black outline-none appearance-none cursor-pointer"
                           >
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                              <option value="YEARLY">Yearly</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4">
                     <PremiumButton type="submit" className="w-full !rounded-2xl shadow-xl shadow-primary-500/20" disabled={submitting}>
                        {submitting ? 'Registering...' : 'Encrypt & Register'}
                     </PremiumButton>
                  </div>
               </form>
            </PremiumCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BillForm;
