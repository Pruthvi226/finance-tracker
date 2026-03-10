import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ExpenseForm from "../components/forms/ExpenseForm";
import TransactionTable, { type Transaction } from "../components/tables/TransactionTable";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type ExpenseApi = {
  id: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
};

const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

const ExpensesPage = () => {
  const [items, setItems] = useState<ExpenseApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExpenseApi | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter !== "all") params.category = categoryFilter;
      const res = await api.get<ExpenseApi[]>("/expenses", { params });
      setItems(res.data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryFilter]);

  const handleSubmit = async (values: {
    amount: number;
    category: string;
    date: string;
    description?: string;
  }) => {
    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, values);
        toast.success("Expense updated");
      } else {
        await api.post("/expenses", values);
        toast.success("Expense added");
      }
      setEditing(null);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save expense");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      load();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const filtered: Transaction[] = useMemo(
    () =>
      items
        .filter(
          (i) =>
            !search ||
            i.category.toLowerCase().includes(search.toLowerCase()) ||
            (i.description || "").toLowerCase().includes(search.toLowerCase())
        )
        .map((i) => ({
          id: i.id,
          amount: i.amount,
          category: i.category,
          date: i.date,
          description: i.description,
        })),
    [items, search]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Expenses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and categorize your spending
        </Typography>
      </Box>

      <ExpenseForm
        categories={CATEGORIES}
        initial={
          editing
            ? {
                amount: editing.amount,
                category: editing.category,
                date: editing.date,
                description: editing.description,
              }
            : null
        }
        onSubmit={handleSubmit}
      />

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={2}
        alignItems="center"
        flexWrap="wrap"
      >
        <TextField
          select
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All categories</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          placeholder="Search by category or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 340, width: "100%", flex: 1 }}
        />
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      ) : (
        <TransactionTable
          data={filtered}
          type="expense"
          onEdit={(t) => {
            const found = items.find((i) => i.id === t.id) ?? null;
            setEditing(found);
          }}
          onDelete={handleDelete}
        />
      )}
    </motion.div>
  );
};

export default ExpensesPage;
