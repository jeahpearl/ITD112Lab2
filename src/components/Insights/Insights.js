import React, { useState, useEffect } from "react";
import { Line, Doughnut, Bubble, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "./Insights.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Insights = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("distributions");

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "natData"));
      const rawData = snapshot.docs.map((doc) => doc.data());
      setData(rawData);
    };

    fetchData();
  }, []);

  // Chart data setups
  const densityPlotData = {
    labels: data.map((_, index) => `Student ${index + 1}`),
    datasets: [
      {
        label: "NAT Density",
        data: data.map((item) => item.nat_results),
        borderColor: "#00A0A0",
        backgroundColor: "rgba(0, 160, 160, 0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const lineChartData = {
    labels: data.map((_, index) => `Student ${index + 1}`),
    datasets: [
      {
        label: "Academic Performance Over Time",
        data: data.map((item) => item.academic_performance),
        borderColor: "#FFA500",
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const stackedBarData = {
    labels: ["Poor", "Good", "Excellent"],
    datasets: [
      {
        label: "Above Poverty Line",
        data: [
          data.filter((item) => item.study_habit === "Poor" && item.socio_economic_status === "Above poverty line").length,
          data.filter((item) => item.study_habit === "Good" && item.socio_economic_status === "Above poverty line").length,
          data.filter((item) => item.study_habit === "Excellent" && item.socio_economic_status === "Above poverty line").length,
        ],
        backgroundColor: "#00A0A0",
      },
      {
        label: "Below Poverty Line",
        data: [
          data.filter((item) => item.study_habit === "Poor" && item.socio_economic_status === "Below poverty line").length,
          data.filter((item) => item.study_habit === "Good" && item.socio_economic_status === "Below poverty line").length,
          data.filter((item) => item.study_habit === "Excellent" && item.socio_economic_status === "Below poverty line").length,
        ],
        backgroundColor: "#F0E800",
      },
    ],
  };

  const doughnutData = {
    labels: ["Cebuano", "Maranao", "Iliganon"],
    datasets: [
      {
        label: "Ethnic Groups",
        data: [
          data.filter((item) => item.ethnic === "Cebuano").length,
          data.filter((item) => item.ethnic === "Maranao").length,
          data.filter((item) => item.ethnic === "Iliganon").length,
        ],
        backgroundColor: ["#00A0A0", "#F0E800", "#FFA500"],
      },
    ],
  };

  const bubbleData = {
    datasets: [
      {
        label: "NAT vs Academic Performance",
        data: data.map((item) => ({
          x: item.nat_results,
          y: item.academic_performance,
          r: Math.random() * 10 + 5,
        })),
        backgroundColor: "rgba(255, 165, 0, 0.6)",
        borderColor: "#FFA500",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="insights-container">
      <div className="tabs">
        {["Distributions", "Trends", "Comparisons", "Proportions", "Relationships"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`tab-button ${activeTab === tab.toLowerCase() ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="content">
        {activeTab === "distributions" && (
          <div className="chart-card">
            <h3>Density Plot: NAT Results</h3>
            <Line data={densityPlotData} />
          </div>
        )}
        {activeTab === "trends" && (
          <div className="chart-card">
            <h3>Line Graph: Academic Performance Over Time</h3>
            <Line data={lineChartData} />
          </div>
        )}
        {activeTab === "comparisons" && (
          <div className="chart-card">
            <h3>Stacked Bar Graph: Study Habits vs Socio-Economic Status</h3>
            <Bar data={stackedBarData} options={{
              plugins: {
                tooltip: { mode: "index", intersect: false },
                legend: { position: "top" },
              },
              scales: {
                x: { stacked: true },
                y: { stacked: true },
              },
            }} />
          </div>
        )}
        {activeTab === "proportions" && (
          <div className="chart-card">
            <h3>Doughnut Chart: Ethnic Groups</h3>
            <Doughnut data={doughnutData} />
          </div>
        )}
        {activeTab === "relationships" && (
          <div className="chart-card">
            <h3>Bubble Chart: NAT Results vs Academic Performance</h3>
            <Bubble data={bubbleData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
