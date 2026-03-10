import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
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
  Filler,
} from "chart.js";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import SavingsIcon from "@mui/icons-material/Savings";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type Analytics = {
  categorySpending: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  monthlyIncome: Record<string, number>;
};

const toNum = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

const AnalyticsPage = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Analytics>("/analytics");
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryEntries = useMemo(() => {
    if (!data?.categorySpending || typeof data.categorySpending !== "object") return [];
    return Object.entries(data.categorySpending).map(([k, v]) => [k, toNum(v)] as const);
  }, [data]);

  const monthlyExpEntries = useMemo(() => {
    if (!data?.monthlyExpenses || typeof data.monthlyExpenses !== "object") return [];
    return Object.entries(data.monthlyExpenses)
      .map(([k, v]) => [k, toNum(v)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const monthlyIncEntries = useMemo(() => {
    if (!data?.monthlyIncome || typeof data.monthlyIncome !== "object") return [];
    return Object.entries(data.monthlyIncome)
      .map(([k, v]) => [k, toNum(v)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const mostExpensiveCategory = useMemo(() => {
    if (categoryEntries.length === 0) return null;
    return categoryEntries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  }, [categoryEntries]);

  const incomeVsExpenseData = useMemo(() => {
    const months = Array.from(
      new Set([
        ...monthlyExpEntries.map(([m]) => m),
        ...monthlyIncEntries.map(([m]) => m),
      ])
    ).sort();

    if (months.length === 0) return null;

    const incMap = Object.fromEntries(monthlyIncEntries);
    const expMap = Object.fromEntries(monthlyExpEntries);

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: months.map((m) => incMap[m] ?? 0),
          backgroundColor: "rgba(34,197,94,0.7)",
        },
        {
          label: "Expenses",
          data: months.map((m) => expMap[m] ?? 0),
          backgroundColor: "rgba(248,113,113,0.8)",
        },
      ],
    };
  }, [monthlyExpEntries, monthlyIncEntries]);

  const savingsRates = useMemo(() => {
    const rates: { month: string; rate: number }[] = [];
    const incMap = Object.fromEntries(monthlyIncEntries);
    const expMap = Object.fromEntries(monthlyExpEntries);
    const months = Array.from(
      new Set([...Object.keys(incMap), ...Object.keys(expMap)])
    ).sort();

    for (const m of months) {
      const inc = toNum(incMap[m]);
      const exp = toNum(expMap[m]);
      const rate = inc > 0 ? Math.max(0, ((inc - exp) / inc) * 100) : 0;
      rates.push({ month: m, rate });
    }
    return rates;
  }, [monthlyIncEntries, monthlyExpEntries]);

  const spendingTrendData = useMemo(() => {
    if (monthlyExpEntries.length === 0) return null;
    return {
      labels: monthlyExpEntries.map(([m]) => m),
      datasets: [
        {
          label: "Monthly spending",
          data: monthlyExpEntries.map(([, v]) => v),
          borderColor: "rgba(59,130,246,0.9)",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [monthlyExpEntries]);

  const categoryPieData = useMemo(() => {
    if (categoryEntries.length === 0) return null;
    return {
      labels: categoryEntries.map(([n]) => n),
      datasets: [
        {
          data: categoryEntries.map(([, v]) => v),
          backgroundColor: [
            "#3b82f6",
            "#22c55e",
            "#eab308",
            "#f97316",
            "#ec4899",
            "#8b5cf6",
            "#06b6d4",
          ],
        },
      ],
    };
  }, [categoryEntries]);

  const avgSavingsRate =
    savingsRates.length > 0
      ? savingsRates.reduce((s, r) => s + r.rate, 0) / savingsRates.length
      : 0;

  const isEmpty = !loading && categoryEntries.length === 0 && monthlyExpEntries.length === 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#94a3b8" } },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 45 },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.15)" },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Spending trends, category breakdown, and savings insights
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
        </Grid>
      ) : isEmpty ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No analytics data yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add income and expenses to see spending trends and insights
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CategoryIcon color="primary" fontSize="small" />
                      <Typography variant="caption" color="text.secondary">
                        Most expensive category
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {mostExpensiveCategory?.[0] ?? "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{mostExpensiveCategory?.[1]?.toFixed(2) ?? "0.00"} total
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <SavingsIcon color="success" fontSize="small" />
                      <Typography variant="caption" color="text.secondary">
                        Avg. savings rate
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {avgSavingsRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Income vs Expense
                  </Typography>
                  {incomeVsExpenseData ? (
                    <Bar data={incomeVsExpenseData} options={chartOptions} height={260} />
                  ) : (
                    <Box height={260} display="flex" alignItems="center" justifyContent="center" color="text.disabled">
                      <Typography>No monthly data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category breakdown
                  </Typography>
                  {categoryPieData ? (
                    <Pie
                      data={categoryPieData}
                      options={{
                        plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
                      }}
                    />
                  ) : (
                    <Box height={260} display="flex" alignItems="center" justifyContent="center" color="text.disabled">
                      <Typography>No category data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TrendingUpIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Spending trend
                    </Typography>
                  </Box>
                  {spendingTrendData ? (
                    <Line data={spendingTrendData} options={chartOptions} height={260} />
                  ) : (
                    <Box height={260} display="flex" alignItems="center" justifyContent="center" color="text.disabled">
                      <Typography>No spending data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;
