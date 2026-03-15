import { useEffect, useState } from "react";
import api from "../../services/api";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Skeleton from "@mui/material/Skeleton";
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

type FinancialHealthDto = {
  score: number;
  scoreBreakdown: string;
  recommendations: string;
};

const FinancialHealthCard = () => {
  const [data, setData] = useState<FinancialHealthDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const res = await api.get<FinancialHealthDto>("/insights/health");
      setData(res.data);
    } catch {
      // Graceful fallback if API fails
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 50) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  if (loading) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center min-h-[250px]">
        <Skeleton variant="circular" width={120} height={120} />
        <Skeleton variant="text" sx={{ mt: 2, width: '80%' }} />
        <Skeleton variant="text" sx={{ width: '60%' }} />
      </div>
    );
  }

  if (!data) return null;

  const chartData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [data.score, 100 - data.score],
        backgroundColor: [
          getScoreColor(data.score),
          "rgba(30, 41, 59, 0.5)" // slate-800 with opacity
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="glass-card p-6 h-full border border-primary-500/20 relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors"></div>
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <MonitorHeartIcon className="text-primary-500 dark:text-primary-400" /> Health Score
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/5">
          Powered by AI ✨
        </span>
      </div>

      <div className="relative h-32 w-full mt-4 flex items-end justify-center">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-x-0 bottom-0 text-center flex flex-col items-center justify-end pb-2">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="text-4xl font-black"
            style={{ color: getScoreColor(data.score) }}
          >
            {data.score}
          </motion.div>
          <div className="text-xs uppercase tracking-widest text-gray-600 dark:text-slate-500 font-black mt-1">out of 100</div>
        </div>
      </div>

      <div className="mt-6 space-y-4 relative z-10">
        <div className="bg-white/40 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-inner">
          <p className="text-sm font-bold text-gray-900 dark:text-slate-200 leading-relaxed italic">
            "{data.recommendations}"
          </p>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1.5 justify-center mt-2">
           <svg className="w-4 h-4 text-primary-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate font-bold">{data.scoreBreakdown}</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthCard;
