import { useMemo } from "react";
import { Tooltip } from "@mui/material";

type HeatmapProps = {
  data: { date: string; amount: number }[]; /* Date formatted as YYYY-MM-DD */
};

export const ActivityHeatmap = ({ data }: HeatmapProps) => {
  const { weeks } = useMemo(() => {
    const today = new Date();
    const days = 90; // approx 3 months
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const lookup: Record<string, number> = {};
    let currentMax = 0;
    
    // Format data into map
    data.forEach(d => {
      lookup[d.date] = d.amount;
      if (d.amount > currentMax) currentMax = currentMax = d.amount;
    });

    const calendarWeeks: { date: Date; amount: number; level: number }[][] = [];
    let currentWeek: { date: Date; amount: number; level: number }[] = [];

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      const isoDate = d.toISOString().split("T")[0];
      const amount = lookup[isoDate] || 0;
      
      // Determine activity level (0-4)
      let level = 0;
      if (amount > 0) {
        if (amount > currentMax * 0.75) level = 4;
        else if (amount > currentMax * 0.5) level = 3;
        else if (amount > currentMax * 0.25) level = 2;
        else level = 1;
      }

      currentWeek.push({ date: d, amount, level });

      // If Sunday or last day, push week
      if (d.getDay() === 0 || i === days) {
        calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: calendarWeeks, maxAmount: currentMax };
  }, [data]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return "bg-primary-600";
      case 3: return "bg-primary-500";
      case 2: return "bg-primary-400";
      case 1: return "bg-primary-300";
      default: return "bg-gray-100 dark:bg-slate-800";
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="min-w-max flex gap-1">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((day, dIdx) => (
              <Tooltip 
                key={dIdx} 
                title={`${day.date.toLocaleDateString()}: ₹${day.amount.toLocaleString()}`}
                arrow
                placement="top"
              >
                <div 
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[3px] sm:rounded-sm transition-colors duration-300 ${getLevelColor(day.level)} hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-slate-900 cursor-pointer`}
                />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-textSecondary dark:text-slate-500 font-bold uppercase tracking-widest justify-end w-full">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-gray-100 dark:bg-slate-800" />
        <div className="w-3 h-3 rounded-[3px] bg-primary-300" />
        <div className="w-3 h-3 rounded-[3px] bg-primary-400" />
        <div className="w-3 h-3 rounded-[3px] bg-primary-500" />
        <div className="w-3 h-3 rounded-[3px] bg-primary-600" />
        <span>More</span>
      </div>
    </div>
  );
};
