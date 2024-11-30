"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUser } from "react-icons/fa";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import AllTrades from "@/app/components/user/AllTrades";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Trading Performance",
        data: [10, 20, 15, 30, 25],
        backgroundColor: "rgba(59, 130, 246, 0.8)", // A blue theme
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(229, 231, 235, 1)", // Light gray for better visibility
        },
      },
      title: {
        display: true,
        text: "Monthly Trading Performance",
        color: "rgba(229, 231, 235, 1)", // Light gray for the title
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(209, 213, 219, 1)", // Light gray for x-axis labels
        },
        grid: {
          color: "rgba(75, 100, 35, 0.5)", // Subtle gridlines
        },
      },
      y: {
        ticks: {
          color: "rgba(209, 213, 219, 1)", // Light gray for y-axis labels
        },
        grid: {
          color: "rgba(75, 100, 35, 0.5)", // Subtle gridlines
        },
      },
    },
  };

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="w-screen px-20 py-5 min-h-[88vh]"
    >
      <ResizablePanel defaultSize={65}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35}>
            <div className="flex flex-col gap-5 p-3 h-[55vh]">
              <div className=" rounded-full h-1/3 flex">
                <div className="bg-yellow-200/30 h-full rounded-full aspect-square"></div>
              </div>
              <div className="bg-gray-400 h-2/3">2</div>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-gray-700" withHandle />
          <ResizablePanel defaultSize={65}>
            <AllTrades userId="1" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle className="bg-gray-700" bigHandle />
      <ResizablePanel defaultSize={35}>
        <div className="p-10 bg-neutral-800/70 rounded-lg shadow-lg flex justify-center items-center">
          <Bar data={data} options={options} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Dashboard;
