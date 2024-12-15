import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Chart, registerables } from "chart.js";
import { Bar, Pie, Line, Scatter } from "react-chartjs-2";
import { RiBarChart2Fill, RiUserStarFill, RiUser3Fill } from "react-icons/ri";
import "./Dashboard.css";


// Register all Chart.js components
Chart.register(...registerables);

const Dashboard = () => {
  const [natData, setNatData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const natCollection = collection(db, "natData");
      const snapshot = await getDocs(natCollection);
      const data = snapshot.docs.map((doc) => doc.data());
      setNatData(data);

      const sortedData = [...data].sort((a, b) => b.nat_results - a.nat_results);
      setTopStudents(sortedData.slice(0, 5));
    };

    fetchData();
  }, []);

  const average = (arr, key) =>
    arr.length
      ? (arr.reduce((sum, item) => sum + Number(item[key]), 0) / arr.length).toFixed(2)
      : "0.00";

  // Chart options with axis labels
  // Chart options with axis labels
const chartOptions = (xLabel, yLabel) => ({
  responsive: true,
  maintainAspectRatio: false, // Ensure chart fits the container
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#d4f4f4", // Lighten text color
        font: {
          size: 16, // Increase font size by +1
        },
      },
    },
  },
  layout: {
    padding: {
      bottom: 20, // Adds extra space below the chart for the x-axis label
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: xLabel,
        color: "#d4f4f4", // Lighten text color
        font: {
          size: 18, // Increase font size by +1
          weight: "bold",
        },
      },
      ticks: {
        color: "#d4f4f4", // Lighten text color
        font: {
          size: 12, // Increase font size by +1
        },
      },
    },
    y: {
      title: {
        display: true,
        text: yLabel,
        color: "#d4f4f4", // Lighten text color
        font: {
          size: 15, // Increase font size by +1
          weight: "bold",
        },
      },
      ticks: {
        color: "#d4f4f4", // Lighten text color
        font: {
          size: 15, // Increase font size by +1
        },
      },
    },
  },
});

  
  

  // Data for charts
  const schoolTypeChartData = {
    labels: ["Private", "Public"],
    datasets: [
      {
        label: "Number of Students",
        data: [
          natData.filter((item) => item.type_of_school === "Private").length,
          natData.filter((item) => item.type_of_school === "Public").length,
        ],
        backgroundColor: ["#00A0A0", "#F0E800"],
      },
    ],
  };

  const studyHabitChartData = {
    labels: ["Poor", "Good", "Excellent"],
    datasets: [
      {
        data: [
          natData.filter((item) => item.study_habit === "Poor").length,
          natData.filter((item) => item.study_habit === "Good").length,
          natData.filter((item) => item.study_habit === "Excellent").length,
        ],
        backgroundColor: ["#00A0A0", "#F0E800", "#FFA500"],
      },
    ],
  };

  const socioEconomicChartData = {
    labels: ["Above Poverty Line", "On Poverty Line", "Below Poverty Line"],
    datasets: [
      {
        label: "Number of Students",
        data: [
          natData.filter((item) => item.socio_economic_status === "Above poverty line").length,
          natData.filter((item) => item.socio_economic_status === "On poverty line").length,
          natData.filter((item) => item.socio_economic_status === "Below poverty line").length,
        ],
        backgroundColor: ["#00A0A0", "#F0E800", "#FFA500"],
      },
    ],
  };

  const ethnicChartData = {
    labels: [...new Set(natData.map((item) => item.ethnic))],
    datasets: [
      {
        label: "Number of Students",
        data: [...new Set(natData.map((item) => item.ethnic))].map(
          (ethnic) => natData.filter((item) => item.ethnic === ethnic).length
        ),
        backgroundColor: ["#64fcfc", "#f0e800", "#ffa500"], // Use light colors from the color scheme
      },
    ],
  };
  

  const genderChartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Number of Students",
        data: [
          natData.filter((item) => item.sex === "Male").length,
          natData.filter((item) => item.sex === "Female").length,
        ],
        backgroundColor: ["#00A0A0", "#F0E800"],
      },
    ],
  };

  const natLineChartData = {
    labels: natData.map((_, index) => `Student ${index + 1}`),
    datasets: [
      {
        label: "NAT Results",
        data: natData.map((item) => item.nat_results),
        fill: false,
        borderColor: "#00A0A0",
        backgroundColor: "#F0E800",
        tension: 0.4,
      },
    ],
  };

  const scatterChartData = {
    datasets: [
      {
        label: "NAT vs Academic Performance",
        data: natData.map((item) => ({
          x: item.nat_results,
          y: item.academic_performance,
        })),
        backgroundColor: "#00A0A0",
      },
    ],
  };

  return (
    <div className="dashboard-container">
            {/* Top Metrics */}
            <div className="metrics">
        <div className="metric-card">
          <div className="metric-title">
            <RiBarChart2Fill className="metric-icon" />
            Average NAT Score
          </div>
          <span>{average(natData, "nat_results")}</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <RiUserStarFill className="metric-icon" />
            Average Academic Performance
          </div>
          <span>{average(natData, "academic_performance")}</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <RiUser3Fill className="metric-icon" />
            Total Students
          </div>
          <span>{natData.length}</span>
        </div>
      </div>


      {/* Distribution Charts */}
            <div className="charts-container">
        <div className="chart-card">
          <h3>School Type Distribution</h3>
          <Bar data={schoolTypeChartData} options={chartOptions("School Type", "Number of Students")} />
        </div>
        <div className="chart-card">
          <h3>Study Habit Distribution</h3>
          <Pie data={studyHabitChartData} />
        </div>
        <div className="chart-card">
          <h3>Socio-Economic Status Distribution</h3>
          <Bar data={socioEconomicChartData} options={chartOptions("Status", "Number of Students")} />
        </div>
        <div className="chart-card">
          <h3>Ethnic Distribution</h3>
          <Bar data={ethnicChartData} options={chartOptions("Ethnic Group", "Number of Students")} />
        </div>
        <div className="chart-card">
          <h3>Gender Distribution</h3>
          <Pie data={genderChartData} />
        </div>
        <div className="chart-card wide">
          <h3>NAT Results Trend</h3>
          <Line data={natLineChartData} options={chartOptions("Student", "NAT Results")} />
        </div>
        <div className="chart-card wide">
          <h3>NAT vs Academic Performance</h3>
          <Scatter data={scatterChartData} options={chartOptions("NAT Results", "Academic Performance")} />
        </div>
      </div>
      
      {/* Top Performing Students */}
      <div className="top-students">
        <h3>Top Performing Students</h3>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>NAT Results</th>
              <th>Academic Performance</th>
              <th>Type of School</th>
              <th>Study Habit</th>
              <th>Socio-Economic Status</th>
            </tr>
          </thead>
          <tbody>
            {topStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.respondents}</td>
                <td>{student.nat_results}</td>
                <td>{student.academic_performance}</td>
                <td>{student.type_of_school}</td>
                <td>{student.study_habit}</td>
                <td>{student.socio_economic_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
