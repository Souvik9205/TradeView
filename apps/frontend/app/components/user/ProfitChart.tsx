"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: { month: string; profit: number }[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Monthly Profit ($)",
        data: data.map((d) => d.profit),
        borderColor: "rgba(234, 179, 8, 1)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        pointBackgroundColor: "rgba(234, 179, 8, 1)",
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // This is key for true responsiveness
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255, 255, 255, 0.8)" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "rgba(255, 255, 255, 0.8)" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
    },
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
