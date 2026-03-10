import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import IncomeForm from "../components/forms/IncomeForm";
import TransactionTable, { type Transaction } from "../components/tables/TransactionTable";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type IncomeApi = {
  id: number;
  amount: number;
  source: string;
  date: string;
  description?: string;
};

const IncomePage = () => {
  const [items, setItems] = useState<IncomeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<IncomeApi | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<IncomeApi[]>("/income");
      setItems(res.data);
    } catch {
      toast.error("Failed to load income");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values: {
    amount: number;
    source: string;
    date: string;
    description?: string;
  }) => {
    try {
      if (editing) {
        await api.put(`/income/${editing.id}`, values);
        toast.success("Income updated");
      } else {
        await api.post("/income", values);
        toast.success("Income added");
      }
      setEditing(null);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save income");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/income/${id}`);
      toast.success("Income deleted");
      load();
    } catch {
      toast.error("Failed to delete income");
    }
  };

  const filtered: Transaction[] = useMemo(
    () =>
      items
        .filter(
          (i) =>
            !search ||
            i.source.toLowerCase().includes(search.toLowerCase()) ||
            (i.description || "").toLowerCase().includes(search.toLowerCase())
        )
        .map((i) => ({
          id: i.id,
          amount: i.amount,
          source: i.source,
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
          Income
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your income and manage sources
        </Typography>
      </Box>

      <IncomeForm
        initial={
          editing
            ? {
                amount: editing.amount,
                source: editing.source,
                date: editing.date,
                description: editing.description,
              }
            : null
        }
        onSubmit={handleSubmit}
      />

      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={2} alignItems="center">
        <TextField
          placeholder="Search by source or description..."
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
          sx={{ maxWidth: 340, width: "100%" }}
        />
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      ) : (
        <TransactionTable
          data={filtered}
          type="income"
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

export default IncomePage;
