import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { toast } from "react-hot-toast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SavingsIcon from "@mui/icons-material/Savings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
}

const accountTypeIcons: Record<string, any> = {
  BANK_ACCOUNT: AccountBalanceIcon,
  SAVINGS_ACCOUNT: SavingsIcon,
  CASH_WALLET: AccountBalanceWalletIcon,
  UPI_WALLET: PhoneIphoneIcon,
  CREDIT_CARD: CreditCardIcon,
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
    currency: "USD",
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
        toast.success("Account updated!");
      } else {
        await api.post("/accounts", formData);
        toast.success("Account created!");
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({ accountName: "", accountType: "BANK_ACCOUNT", balance: 0, currency: "USD" });
      fetchAccounts();
    } catch (error) {
      toast.error("Error saving account");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success("Account deleted");
      fetchAccounts();
    } catch (error) {
      toast.error("Error deleting account");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-textHeadings dark:text-slate-100 uppercase tracking-tight">Financial Accounts</h1>
          <p className="text-sm font-black text-textSecondary dark:text-slate-400 mt-2 uppercase tracking-widest">Manage your banks, wallets, and cards</p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormData({ accountName: "", accountType: "BANK_ACCOUNT", balance: 0, currency: "USD" });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <AddIcon />
          Add Account
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 glass-card animate-pulse bg-gray-200/50 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const Icon = accountTypeIcons[account.accountType] || AccountBalanceIcon;
            return (
              <motion.div
                key={account.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
              >
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-600/10 transition-colors" />

                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-border dark:border-white/5">
                    <Icon className="text-primary-600 dark:text-primary-400" fontSize="large" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(account)}
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 text-textMuted dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-textMuted dark:text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-black text-textHeadings dark:text-slate-100 uppercase tracking-tight">{account.accountName}</h3>
                  <p className="text-[10px] text-textSecondary dark:text-slate-500 uppercase tracking-widest font-black mt-1">
                    {account.accountType.replace("_", " ")}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    {account.currency} {account.balance.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Account Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md p-6 overflow-hidden relative"
            >
              <h2 className="text-xl font-black mb-8 text-textHeadings dark:text-white uppercase tracking-widest">
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Account Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. HDFC Bank, My Wallet"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Account Type</label>
                  <select
                    className="input-field appearance-none cursor-pointer"
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  >
                    <option value="BANK_ACCOUNT">Bank Account</option>
                    <option value="SAVINGS_ACCOUNT">Savings Account</option>
                    <option value="CASH_WALLET">Cash Wallet</option>
                    <option value="UPI_WALLET">UPI Wallet</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Balance</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-textSecondary dark:text-slate-300 mb-1.5 uppercase tracking-wide">Currency</label>
                    <select
                      className="input-field appearance-none"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-textSecondary dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold border border-border dark:border-white/5 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingAccount ? "Update Account" : "Create Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;
