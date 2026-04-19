import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { 
  Landmark, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { PremiumButton } from "../components/ui/PremiumButton";
import { PremiumBadge } from "../components/ui/PremiumBadge";

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
}

const accountTypeIcons: Record<string, any> = {
  BANK_ACCOUNT: Landmark,
  SAVINGS_ACCOUNT: PiggyBank,
  CASH_WALLET: Wallet,
  UPI_WALLET: Smartphone,
  CREDIT_CARD: CreditCard,
};

const accountTypeColors: Record<string, any> = {
  BANK_ACCOUNT: "indigo",
  SAVINGS_ACCOUNT: "emerald",
  CASH_WALLET: "amber",
  UPI_WALLET: "cyan",
  CREDIT_CARD: "rose",
};

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "BANK_ACCOUNT",
    balance: 0,
    currency: "INR",
  });

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, formData);
        toast.success("Account updated successfully");
      } else {
        await api.post("/accounts", formData);
        toast.success("Account created successfully");
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({ accountName: "", accountType: "BANK_ACCOUNT", balance: 0, currency: "INR" });
      fetchAccounts();
    } catch (error) {
      toast.error("Error saving account details");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this account? All associated transactions will be affected.")) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success("Account detached successfully");
      fetchAccounts();
    } catch (error) {
      toast.error("Error deleting financial account");
    }
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
    });
    setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-black tracking-tight text-textHeadings dark:text-white leading-none">
              Portfolios & Assets
            </h1>
            <PremiumBadge color="emerald">
              {accounts.length} Active
            </PremiumBadge>
          </div>
          <p className="text-[14px] font-medium text-textSecondary dark:text-slate-400">
            Organize your wealth across multiple banks, digital wallets, and cards.
          </p>
        </div>

        <PremiumButton 
          onClick={() => {
            setEditingAccount(null);
            setFormData({ accountName: "", accountType: "BANK_ACCOUNT", balance: 0, currency: "INR" });
            setShowModal(true);
          }}
          className="shadow-xl shadow-primary-500/30"
        >
          <Plus size={18} strokeWidth={3} />
          Create Portfolio
        </PremiumButton>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[24px] bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {accounts.map((account, idx) => {
            const Icon = accountTypeIcons[account.accountType] || Landmark;
            const cardVariant = accountTypeColors[account.accountType] || 'indigo';

            return (
              <PremiumCard
                key={account.id}
                variant={idx % 3 === 0 ? 'indigo' : idx % 3 === 1 ? 'emerald' : 'blue'}
                delayIndex={idx}
                className="relative h-64 !p-0 group overflow-hidden border-none shadow-2xl"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transform group-hover:rotate-12 transition-transform duration-500">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="h-full flex flex-col justify-between p-8 relative z-10 text-white">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1 group-hover:translate-x-1 transition-transform">
                      {account.accountName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <PremiumBadge color="gray" className="!bg-white/10 !text-white !border-white/20 !px-2 !py-0.5 !text-[9px]">
                        {account.accountType.replace("_", " ")}
                      </PremiumBadge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Current Liquidity</p>
                      <h4 className="text-3xl font-black tracking-tight">
                        <span className="text-lg opacity-60 mr-1.5">{account.currency}</span>
                        {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">**** **** **** {account.id.toString().padStart(4, '0')}</p>
                       <div className="flex items-center gap-3">
                        <button 
                          onClick={() => openEditModal(account)}
                          className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="h-8 w-8 rounded-lg bg-white/10 hover:bg-rose-500/30 flex items-center justify-center transition-colors border border-white/10"
                        >
                          <Trash2 size={14} />
                        </button>
                       </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            );
          })}

          {/* Add New Quick Card */}
          <button 
            onClick={() => setShowModal(true)}
            className="h-64 rounded-[24px] border-2 border-dashed border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-4 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
          >
            <div className="h-14 w-14 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-textMuted group-hover:text-primary-600 group-hover:bg-primary-50 transition-all">
              <Plus size={32} />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-textMuted group-hover:text-primary-600 transition-colors">Attach Portfolio</p>
          </button>
        </div>
      )}

      {/* Account Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-[32px] p-10 shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-[#8B5CF6]" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-textHeadings dark:text-white uppercase">
                    {editingAccount ? "Modify Portfolio" : "Anchor New Asset"}
                  </h2>
                  <p className="text-xs font-bold text-textSecondary dark:text-slate-400 mt-1 uppercase tracking-widest">Provide the core financial details</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-textPrimary transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Identity Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold placeholder:text-textMuted outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
                    placeholder="e.g. Chase Primrose, Kraken Wallet"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Portfolio Type</label>
                    <div className="relative">
                      <select
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/5 transition-all appearance-none cursor-pointer"
                        value={formData.accountType}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                      >
                        <option value="BANK_ACCOUNT">Bank Account</option>
                        <option value="SAVINGS_ACCOUNT">Savings Account</option>
                        <option value="CASH_WALLET">Physical Liquid</option>
                        <option value="UPI_WALLET">Digital Wallet</option>
                        <option value="CREDIT_CARD">Credit Exposure</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Valuation</label>
                    <select
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-sm font-bold outline-none transition-all appearance-none"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-textMuted px-1">Initial Reserve</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[18px] px-6 py-4 text-[24px] font-black tracking-tighter outline-none transition-all"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                   <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-[20px] bg-gray-50 dark:bg-white/5 text-textSecondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/10"
                  >
                    Discard
                  </button>
                  <PremiumButton type="submit" className="flex-[1.5] !rounded-[20px]">
                    {editingAccount ? "Confirm Changes" : "Create Asset"}
                  </PremiumButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default AccountsPage;
