import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Plus, 
  AlertCircle, 
  Receipt,
  Download,
  CalendarDays
} from 'lucide-react';
import api from '../services/api';
import { PremiumCard } from '../components/ui/PremiumCard';
import { PremiumButton } from '../components/ui/PremiumButton';
import { PremiumBadge } from '../components/ui/PremiumBadge';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import BillForm from '../components/Bills/BillForm';

interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  recurrence: string;
}

const BillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get<Bill[]>('/bills');
      setBills(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bills');
    } finally {
      // Logic for cleanup if needed
    }
  };

  const handlePay = async (billId: number) => {
    try {
      const res = await api.post<Bill>(`/bills/${billId}/pay`);
      toast.success('Payment protocol complete');
      setBills(prev => prev.map(b => b.id === billId ? res.data : b));
    } catch (err: any) {
      toast.error(err.message || 'Payment processing failed');
    }
  };

  const filteredBills = bills.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const overdueCount = bills.filter(b => b.status === 'OVERDUE').length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <PremiumBadge color="rose" className="mb-4">
              Liability Nexus v1.0
           </PremiumBadge>
           <h1 className="text-4xl font-black text-textPrimary tracking-tight uppercase">
             Monthly Bills
           </h1>
           <p className="text-sm font-medium text-textSecondary dark:text-slate-400 mt-2">
             Automated tracking of your recurring financial obligations.
           </p>
        </div>
        <div className="flex gap-4">
           <PremiumButton variant="glass" className="!rounded-2xl">
              <Download size={18} /> Export Report
           </PremiumButton>
           <PremiumButton onClick={() => setShowAddForm(true)} className="!rounded-2xl shadow-xl shadow-primary-500/20">
              <Plus size={18} /> Add New Bill
           </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Summary Widget */}
         <PremiumCard variant="white" className="lg:col-span-1 border-rose-500/20">
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                     <AlertCircle size={24} />
                  </div>
                  <PremiumBadge color="rose">Urgent</PremiumBadge>
               </div>
               <div>
                  <h3 className="text-xs font-black uppercase text-textMuted tracking-[0.2em]">Overdue Total</h3>
                  <div className="text-3xl font-black text-textPrimary mt-1">
                    {formatCurrency(bills.filter(b => b.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase">{overdueCount} BILLS REQUIRE IMMEDIATE SYNC</p>
               </div>
            </div>
         </PremiumCard>

         {/* Bills Grid */}
         <div className="lg:col-span-3">
             <div className="flex items-center gap-4 mb-6">
                <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/10">
                   {(['ALL', 'UNPAID', 'OVERDUE'] as const).map((f) => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-white/10 shadow-sm text-primary-500' : 'text-textMuted hover:text-textPrimary'}`}
                      >
                         {f}
                      </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                {filteredBills.map((bill) => (
                   <motion.div 
                    key={bill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                   >
                     <PremiumCard variant="white" className={`group relative transition-all duration-500 ${bill.status === 'OVERDUE' ? 'border-rose-500/30' : ''}`}>
                        <div className="flex flex-col gap-6">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <div className={`p-3 rounded-2xl ${bill.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : bill.status === 'OVERDUE' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                                    <Receipt size={24} />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-textPrimary uppercase tracking-tight">{bill.name}</h4>
                                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{bill.category}</p>
                                 </div>
                              </div>
                              <PremiumBadge color={bill.status === 'PAID' ? 'emerald' : bill.status === 'OVERDUE' ? 'rose' : 'amber'}>
                                 {bill.status}
                              </PremiumBadge>
                           </div>

                           <div className="flex justify-between items-end">
                              <div>
                                 <div className="text-2xl font-black text-textPrimary">{formatCurrency(bill.amount)}</div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-textMuted mt-1 uppercase tracking-tighter">
                                    <CalendarDays size={12} className="text-primary-500" />
                                    Due: {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                                 </div>
                              </div>
                              {bill.status !== 'PAID' && (
                                <PremiumButton onClick={() => handlePay(bill.id)} variant="primary" className="!py-2 !px-4 !rounded-xl !text-[10px]">
                                   Synchronize
                                </PremiumButton>
                              )}
                           </div>
                        </div>
                     </PremiumCard>
                   </motion.div>
                ))}
                </AnimatePresence>
             </div>
         </div>
      </div>

      <BillForm 
        isOpen={showAddForm} 
        onClose={() => setShowAddForm(false)} 
        onSuccess={fetchBills} 
      />
    </div>
  );
};

export default BillsPage;
