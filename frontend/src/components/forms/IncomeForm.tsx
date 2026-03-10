import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";

type Props = {
  initial?: {
    amount: number;
    source: string;
    date: string;
    description?: string;
  } | null;
  onSubmit: (values: { amount: number; source: string; date: string; description?: string }) => void;
};

const IncomeForm = ({ initial, onSubmit }: Props) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount.toString());
      setSource(initial.source);
      setDate(initial.date);
      setDescription(initial.description || "");
    } else {
      setAmount("");
      setSource("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
    }
  }, [initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      source,
      date,
      description: description || undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Source"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  size="small"
                  placeholder="e.g. Salary, Freelance"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={initial ? <EditIcon /> : <AddIcon />}
                  sx={{ height: 40 }}
                >
                  {initial ? "Update Income" : "Add Income"}
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  size="small"
                  multiline
                  maxRows={2}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IncomeForm;
