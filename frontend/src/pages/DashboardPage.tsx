import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { motion } from "framer-motion";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

type Dashboard = {
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
};

type Analytics = {
  categorySpending: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  monthlyIncome: Record<string, number>;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const [summary, setSummary] = useState<Dashboard | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get<Dashboard>("/dashboard"),
          api.get<Analytics>("/analytics"),
        ]);
        setSummary(dashRes.data);
        setAnalytics(analyticsRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const incomeVsExpenseData = useMemo(() => {
    if (!analytics) return null;
    const months = Array.from(
      new Set([...Object.keys(analytics.monthlyIncome), ...Object.keys(analytics.monthlyExpenses)]),
    ).sort();

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: months.map((m) => analytics.monthlyIncome[m] || 0),
          backgroundColor: "rgba(34,197,94,0.7)",
        },
        {
          label: "Expenses",
          data: months.map((m) => analytics.monthlyExpenses[m] || 0),
          backgroundColor: "rgba(248,113,113,0.8)",
        },
      ],
    };
  }, [analytics]);

  const categoryPieData = useMemo(() => {
    if (!analytics) return null;
    const entries = Object.entries(analytics.categorySpending);
    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#ec4899", "#8b5cf6", "#06b6d4"],
        },
      ],
    };
  }, [analytics]);

  const monthlySpendingLine = useMemo(() => {
    if (!analytics) return null;
    const months = Object.keys(analytics.monthlyExpenses).sort();
    return {
      labels: months,
      datasets: [
        {
          label: "Monthly spending",
          data: months.map((m) => analytics.monthlyExpenses[m] || 0),
          borderColor: "rgba(59,130,246,0.9)",
          backgroundColor: "rgba(59,130,246,0.25)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [analytics]);

  const savings = useMemo(() => {
    if (!summary) return 0;
    const total = summary.totalIncome || 0;
    if (!total) return 0;
    const saved = summary.remainingBalance;
    return Math.max(0, Math.min(100, (saved / total) * 100));
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Typography variant="h5" className="font-semibold">
          Overview
        </Typography>
        <Typography variant="body2" className="text-slate-400">
          High-level summary of your personal finances this month.
        </Typography>
      </div>

      <Grid container spacing={2}>
        {["Total balance", "Monthly income", "Monthly expenses", "Savings rate"].map((label, idx) => {
          const value =
            label === "Total balance"
              ? summary?.remainingBalance
              : label === "Monthly income"
                ? summary?.totalIncome
                : label === "Monthly expenses"
                  ? summary?.totalExpense
                  : savings;

          const prefix = label === "Savings rate" ? "" : "₹";
          const suffix = label === "Savings rate" ? "%" : "";
          const display = value !== undefined && value !== null ? value : null;

          return (
            <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    background:
                      idx === 0
                        ? "radial-gradient(circle at top left, rgba(56,189,248,0.2), transparent 60%)"
                        : idx === 1
                          ? "radial-gradient(circle at top left, rgba(34,197,94,0.2), transparent 60%)"
                          : idx === 2
                            ? "radial-gradient(circle at top left, rgba(248,113,113,0.2), transparent 60%)"
                            : "radial-gradient(circle at top left, rgba(129,140,248,0.2), transparent 60%)",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" className="uppercase tracking-wide text-slate-400">
                      {label}
                    </Typography>
                    {loading || display === null ? (
                      <Skeleton
                        variant="text"
                        sx={{ fontSize: "1.75rem", mt: 1.5, width: "70%", maxWidth: 160 }}
                      />
                    ) : (
                      <Typography
                        variant="h5"
                        className={`mt-1.5 font-semibold ${
                          idx === 1 ? "text-emerald-400" : idx === 2 ? "text-danger" : "text-slate-100"
                        }`}
                      >
                        {prefix}
                        {label === "Savings rate" ? savings.toFixed(1) : Number(display).toFixed(2)}
                        {suffix}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" className="mb-3 text-slate-300">
                Income vs expense
              </Typography>
              {incomeVsExpenseData ? (
                <Bar
                  data={incomeVsExpenseData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top", labels: { color: "#cbd5f5" } },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#9ca3af", maxRotation: 0, minRotation: 0 },
                        grid: { display: false },
                      },
                      y: {
                        ticks: { color: "#9ca3af" },
                        grid: { color: "rgba(55,65,81,0.4)" },
                      },
                    },
                  }}
                  height={260}
                />
              ) : (
                <Skeleton variant="rectangular" width="100%" height={260} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" className="mb-3 text-slate-300">
                Category breakdown
              </Typography>
              {categoryPieData ? (
                <Pie
                  data={categoryPieData}
                  options={{
                    plugins: {
                      legend: { position: "bottom", labels: { color: "#cbd5f5" } },
                    },
                  }}
                />
              ) : (
                <Skeleton variant="rectangular" width="100%" height={220} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" className="mb-3 text-slate-300">
                Monthly spending trend
              </Typography>
              {monthlySpendingLine ? (
                <Line
                  data={monthlySpendingLine}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#9ca3af" },
                        grid: { display: false },
                      },
                      y: {
                        ticks: { color: "#9ca3af" },
                        grid: { color: "rgba(55,65,81,0.4)" },
                      },
                    },
                  }}
                  height={260}
                />
              ) : (
                <Skeleton variant="rectangular" width="100%" height={260} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;

