import React, { useState, useEffect, useMemo } from "react";
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
  const [selectedVariable, setSelectedVariable] = useState("academic_performance");
  const [selectedCategory, setSelectedCategory] = useState("sex"); // Add this
  const [activeTab, setActiveTab] = useState("distributions");
  const [activeSubTab, setActiveSubTab] = useState("Categorical vs. Categorical");
  const [firstCategory, setFirstCategory] = useState("sex");
  const [secondCategory, setSecondCategory] = useState("academic_description");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "natData"));
        const rawData = snapshot.docs.map((doc) => doc.data());
        setData(rawData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Chart Data Calculations

    const categoryDistributionData = useMemo(() => {
  const categoryMapping = {
    sex: ["Male", "Female"],
    academic_description: [
      "Did not meet expectation",
      "Fairly Satisfactory",
      "Very Satisfactory",
      "Satisfactory",
      "Outstanding",
    ],
    iq: ["High", "Average", "Low"],
    type_of_school: ["Private", "Public"],
    socio_economic_status: [
      "Above poverty line",
      "On poverty line",
      "Below poverty line",
    ],
    study_habit: ["Good", "Excellent", "Poor"],
  };

  const labels = categoryMapping[selectedCategory];
  const counts = labels.map(
    (label) => data.filter((item) => item[selectedCategory] === label).length
  );

  return {
    labels,
    datasets: [
      {
        label: `${selectedCategory.replace(/_/g, " ")} Distribution`,
        data: counts,
        backgroundColor: labels.map(
          (_, index) => ["#00A0A0", "#FFA500", "#F0E800", "#E57373", "#AED581"][index % 5]
        ),
      },
    ],
  };
}, [data, selectedCategory]);
    

    const lineChartData = useMemo(() => {
      const variableLabel =
        selectedVariable === "academic_performance" ? "Academic Performance" : "NAT Results";
    
      return {
        labels: data.map((_, index) => `Student ${index + 1}`),
        datasets: [
          {
            label: variableLabel,
            data: data.map((item) => item[selectedVariable]),
            borderColor: selectedVariable === "academic_performance" ? "#FFA500" : "#00A0A0",
            backgroundColor:
              selectedVariable === "academic_performance"
                ? "rgba(255, 165, 0, 0.2)"
                : "rgba(0, 160, 160, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }, [data, selectedVariable]);

    const categoricalChartData = useMemo(() => {
      const groupedData = {};
    
      data.forEach((item) => {
        const firstValue = item[firstCategory];
        const secondValue = item[secondCategory];
    
        if (!groupedData[firstValue]) {
          groupedData[firstValue] = {};
        }
    
        if (!groupedData[firstValue][secondValue]) {
          groupedData[firstValue][secondValue] = 0;
        }
    
        groupedData[firstValue][secondValue]++;
      });
    
      const labels = Object.keys(groupedData);
      const secondLabels = Array.from(
        new Set(Object.values(groupedData).flatMap((obj) => Object.keys(obj)))
      );
    
      const datasets = secondLabels.map((secondLabel) => ({
        label: secondLabel,
        data: labels.map(
          (label) => groupedData[label][secondLabel] || 0
        ),
        backgroundColor: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random colors
      }));
    
      return {
        labels,
        datasets,
      };
    }, [data, firstCategory, secondCategory]);
    

    const categoricalInsights = useMemo(() => {
      if (!data || data.length === 0) return "No data available to generate insights.";
    
      const groupedData = {};
      data.forEach((item) => {
        const firstValue = item[firstCategory];
        const secondValue = item[secondCategory];
        if (!groupedData[firstValue]) groupedData[firstValue] = {};
        if (!groupedData[firstValue][secondValue]) groupedData[firstValue][secondValue] = 0;
        groupedData[firstValue][secondValue]++;
      });
    
      let maxCount = 0;
      let mostCommonCombination = "";
      for (const [firstKey, secondMap] of Object.entries(groupedData)) {
        for (const [secondKey, count] of Object.entries(secondMap)) {
          if (count > maxCount) {
            maxCount = count;
            mostCommonCombination = `${firstKey} and ${secondKey}`;
          }
        }
      }
    
      const dominantFirst = Object.entries(groupedData).reduce((a, b) =>
        Object.values(b[1]).reduce((sum, val) => sum + val, 0) >
        Object.values(a[1]).reduce((sum, val) => sum + val, 0)
          ? b
          : a
      )[0];
    
      const dominantSecond = Object.entries(
        Object.values(groupedData).reduce((result, current) => {
          Object.entries(current).forEach(([key, value]) => {
            result[key] = (result[key] || 0) + value;
          });
          return result;
        }, {})
      ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    
      return {
        insight: `The most frequent combination is "${mostCommonCombination}" (${maxCount} occurrences). 
                  "${dominantFirst}" dominates ${firstCategory}, while "${dominantSecond}" leads ${secondCategory} variable.`,
        mostCommonCombination,
      };
    }, [data, firstCategory, secondCategory]);
    
/* start for cat vs num */
const categoricalNumericalChartData = useMemo(() => {
  const groupedData = {};
  data.forEach((item) => {
    const category = item[firstCategory];
    const numericalValue = parseFloat(item[secondCategory]);

    if (!groupedData[category]) {
      groupedData[category] = { sum: 0, count: 0 };
    }
    if (!isNaN(numericalValue)) {
      groupedData[category].sum += numericalValue;
      groupedData[category].count++;
    }
  });

  const labels = Object.keys(groupedData);
  const averages = labels.map(
    (label) => groupedData[label].sum / groupedData[label].count
  );

  const colors = ["#00A0A0", "#FFA500", "#F0E800", "#E57373", "#AED581"]; // Define your color palette

  return {
    labels,
    datasets: [
      {
        label: `Average of ${secondCategory}`,
        data: averages,
        backgroundColor: labels.map((_, index) => colors[index % colors.length]), // Assign unique colors
      },
    ],
  };
}, [data, firstCategory, secondCategory]);
/* end for cat vs num */

/* start for cat vs num insights*/
const categoricalNumericalInsights = useMemo(() => {
  if (!data || data.length === 0) {
    return { insight: "No data available to generate insights.", highestCategory: "", maxAverage: 0 };
  }

  const groupedData = {};
  data.forEach((item) => {
    const category = item[firstCategory];
    const numericalValue = parseFloat(item[secondCategory]);

    if (!groupedData[category]) {
      groupedData[category] = { sum: 0, count: 0 };
    }
    if (!isNaN(numericalValue)) {
      groupedData[category].sum += numericalValue;
      groupedData[category].count++;
    }
  });

  const insights = Object.entries(groupedData).map(([category, values]) => ({
    category,
    average: values.sum / values.count || 0,
  }));

  const maxAverage = Math.max(...insights.map((entry) => entry.average));
  const highestCategory = insights.find((entry) => entry.average === maxAverage)?.category;

  return {
    insight: `The highest average ${secondCategory} is observed in "${highestCategory}" (${maxAverage.toFixed(2)}). Explore the chart for a detailed comparison of averages across ${firstCategory}.`,
    relationship: `The chart shows that those with "${highestCategory}" in ${firstCategory} are most likely to have the highest average in ${secondCategory}, suggesting a strong relationship between ${firstCategory} and ${secondCategory}.`,
  };
}, [data, firstCategory, secondCategory]);


/* end for cat vs numinsights */

/* start for num vs num insights */
const numericalScatterData = useMemo(() => ({
  datasets: [
    {
      label: `${firstCategory} vs. ${secondCategory}`,
      data: data.map((item) => ({
        x: parseFloat(item[firstCategory]),
        y: parseFloat(item[secondCategory]),
      })),
      backgroundColor: "rgba(0, 160, 160, 0.6)",
      borderColor: "#00A0A0",
      borderWidth: 1,
    },
  ],
}), [data, firstCategory, secondCategory]);

/* start for num vs num insights */
const numericalInsights = useMemo(() => {
  if (!data || data.length === 0) return "No data available to generate insights.";

  const xValues = data.map((item) => parseFloat(item[firstCategory])).filter((v) => !isNaN(v));
  const yValues = data.map((item) => parseFloat(item[secondCategory])).filter((v) => !isNaN(v));

  if (xValues.length === 0 || yValues.length === 0) return "Not enough data for insights.";

  const xSum = xValues.reduce((a, b) => a + b, 0);
  const ySum = yValues.reduce((a, b) => a + b, 0);
  const xMean = xSum / xValues.length;
  const yMean = ySum / yValues.length;
/* end for num vs numinsights */

  // Calculate correlation coefficient (r)
  const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
  const denominator = Math.sqrt(
    xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0) *
    yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0)
  );
  const correlation = denominator ? numerator / denominator : 0;

  const trend =
    correlation > 0.5
      ? "positive"
      : correlation < -0.5
      ? "negative"
      : "weak";

  return `The correlation between ${firstCategory} and ${secondCategory} is ${trend} (${correlation.toFixed(2)}). 
          Explore the scatter plot for detailed trends.`;
}, [data, firstCategory, secondCategory]);

/* end for num vs num insights */

  return (
    <div className="insights-container">
      <div className="tabs">
        {["Distributions", "Trends", "Comparisons"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`tab-button ${activeTab === tab.toLowerCase() ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="content">
               {activeTab === "distributions" && (
            <>
             <div className="content">
  {activeTab === "distributions" && (
    <>
      {/* Dropdown for selecting category */}
      <div className="dropdown-container">
        <label className="dropdown-label">Select Category:</label>
        <select
          className="variable-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="sex">Gender</option>
          <option value="academic_description">Academic Description</option>
          <option value="iq">IQ</option>
          <option value="type_of_school">Type of School</option>
          <option value="socio_economic_status">Socio-Economic Status</option>
          <option value="study_habit">Study Habit</option>
        </select>
      </div>

                   <div className="chart-row">
                      <div className="chart-column chart-card">
                        <h3>{selectedCategory.replace(/_/g, " ")} Distribution</h3>
                        <Bar
                          data={categoryDistributionData} // Update to use `categoryDistributionData`
                          options={{
                            plugins: {
                              tooltip: { mode: "index", intersect: false },
                              legend: { position: "top" },
                            },
                            scales: {
                              x: { title: { display: true, text: selectedCategory.replace(/_/g, " ") } },
                              y: { title: { display: true, text: "Count" } },
                            },
                          }}
                        />
                      </div>
                      <div className="chart-column chart-card">
                        <h3>{selectedCategory.replace(/_/g, " ")} Proportion</h3>
                        <Doughnut
                          data={categoryDistributionData} // Update to use `categoryDistributionData`
                          options={{
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  label: function (tooltipItem) {
                                    const value = tooltipItem.raw;
                                    const total = categoryDistributionData.datasets[0].data.reduce(
                                      (a, b) => a + b,
                                      0
                                    );
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${value} (${percentage}%)`;
                                  },
                                },
                              },
                              legend: { position: "top" },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="insight-container">
  {categoryDistributionData && categoryDistributionData.datasets[0].data.length > 0 ? (
    (() => {
      const { datasets, labels } = categoryDistributionData;
      const data = datasets[0].data; // Access counts
      const total = data.reduce((sum, value) => sum + value, 0);
      
      // Find largest and smallest groups
      const maxIndex = data.indexOf(Math.max(...data));
      const minIndex = data.indexOf(Math.min(...data));

      // Dynamic insight based on selected category
      return `The ${selectedCategory.replace(/_/g, " ")} charts indicate the largest group is "${labels[maxIndex]}" with ${data[maxIndex]} entries (${((data[maxIndex] / total) * 100).toFixed(2)}%), and the smallest group is "${labels[minIndex]}" with ${data[minIndex]} entries (${((data[minIndex] / total) * 100).toFixed(2)}%).`;
    })()
  ) : (
    "No data available for the selected category."
  )}
</div>


          </>
        )}

        {activeTab === "trends" && (
           <>
                    <div className="chart-card">
          <h3>Trends: {selectedVariable === "academic_performance" ? "Academic Performance" : "NAT Results"}</h3>
          <select
            className="variable-dropdown"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
          >
            <option value="academic_performance">Academic Performance</option>
            <option value="nat_results">NAT Results</option>
          </select>
          <Line data={lineChartData} />
        </div>
        <div className="insight-container">
          {selectedVariable === "academic_performance" ? (
            `This chart shows Academic Performance trends across ${data.length} students. The highest performance is ${Math.max(
              ...data.map((item) => item.academic_performance)
            )}, while the lowest is ${Math.min(...data.map((item) => item.academic_performance))}.`
          ) : (
            `This chart shows NAT Results trends across ${data.length} students. The highest score is ${Math.max(
              ...data.map((item) => item.nat_results)
            )}, while the lowest is ${Math.min(...data.map((item) => item.nat_results))}.`
          )}
        </div>

          </>
        )}

        {activeTab === "comparisons" && (
            <>
              {/* Sub-tabs navigation */}
              <div className="sub-tabs">
                {["Categorical vs. Categorical", "Categorical vs. Numerical", "Numerical vs. Numerical"].map((subTab) => (
                  <button
                    key={subTab}
                    onClick={() => setActiveSubTab(subTab)}
                    className={`sub-tab-button ${activeSubTab === subTab ? "active" : ""}`}
                  >
                    {subTab}
                  </button>
                ))}
              </div>

              {/* Render content based on selected sub-tab */}
              <div className="sub-tab-content">
                {activeSubTab === "Categorical vs. Categorical" && (
                  <div>
                    <h3 className="center-title">Categorical vs. Categorical</h3>
                        <div>
                          <div className="dropdown-container">
                              <div>
                                <label className="dropdown-label">Variable 1:</label>
                                <select
                                  className="variable-dropdown"
                                  value={firstCategory}
                                  onChange={(e) => setFirstCategory(e.target.value)}
                                >
                                  <option value="sex">Gender</option>
                                  <option value="academic_description">Academic Description</option>
                                  <option value="iq">IQ</option>
                                  <option value="type_of_school">Type of School</option>
                                  <option value="socio_economic_status">Socio-Economic Status</option>
                                  <option value="study_habit">Study Habit</option>
                                </select>
                              </div>

                              <div>
                                <label className="dropdown-label">Variable 2:</label>
                                <select
                                  className="variable-dropdown"
                                  value={secondCategory}
                                  onChange={(e) => setSecondCategory(e.target.value)}
                                >
                                  <option value="sex">Gender</option>
                                  <option value="academic_description">Academic Description</option>
                                  <option value="iq">IQ</option>
                                  <option value="type_of_school">Type of School</option>
                                  <option value="socio_economic_status">Socio-Economic Status</option>
                                  <option value="study_habit">Study Habit</option>
                                </select>
                              </div>
                            </div>


                            <Bar
                              data={categoricalChartData}
                              options={{
                                plugins: {
                                  tooltip: { mode: "index", intersect: false },
                                  legend: { position: "top" },
                                },
                                scales: {
                                  x: { title: { display: true, text: firstCategory } },
                                  y: { title: { display: true, text: "Count" } },
                                },
                              }}
                            />
                          <div className="insight-container">
                          {categoricalInsights.insight}
                          {` The chart shows that those with the most common "${categoricalInsights.mostCommonCombination}" combination are more frequent. This indicates a strong relationship between ${firstCategory} and ${secondCategory}.`}
                        </div>

                          </div>

                  </div>
                )}

                {activeSubTab === "Categorical vs. Numerical" && (
                        <div>
                          <h3 className="center-title">Categorical vs. Numerical</h3>
                          <div className="dropdown-container">
                            <div>
                              <label className="dropdown-label">Categorical Variable:</label>
                              <select
                                className="variable-dropdown"
                                value={firstCategory}
                                onChange={(e) => setFirstCategory(e.target.value)}
                              >
                                <option value="sex">Gender</option>
                                <option value="academic_description">Academic Description</option>
                                <option value="iq">IQ</option>
                                <option value="type_of_school">Type of School</option>
                                <option value="socio_economic_status">Socio-Economic Status</option>
                                <option value="study_habit">Study Habit</option>
                              </select>
                            </div>
                            <div>
                              <label className="dropdown-label">Numerical Variable:</label>
                              <select
                                className="variable-dropdown"
                                value={secondCategory}
                                onChange={(e) => setSecondCategory(e.target.value)}
                              >
                                <option value="academic_performance">Academic Performance</option>
                                <option value="nat_results">NAT Results</option>
                              </select>
                            </div>
                          </div>
                          <Bar
                            data={categoricalNumericalChartData}
                            options={{
                              plugins: {
                                tooltip: { mode: "index", intersect: false },
                                legend: { position: "top" },
                              },
                              scales: {
                                x: { title: { display: true, text: firstCategory } },
                                y: { title: { display: true, text: `Average ${secondCategory}` } },
                              },
                            }}
                          />
                          <div className="insight-container">
                            {categoricalNumericalInsights.insight}
                            {categoricalNumericalInsights.relationship}
                          </div>
                        </div>
                      )}

                        {activeSubTab === "Numerical vs. Numerical" && (
                          <div>
                            <h3 className="center-title">Numerical vs. Numerical</h3>
                            <div className="dropdown-container">
                              <div>
                                <label className="dropdown-label">Variable 1:</label>
                                <select
                                  className="variable-dropdown"
                                  value={firstCategory}
                                  onChange={(e) => setFirstCategory(e.target.value)}
                                >
                                  <option value="academic_performance">Academic Performance</option>
                                  <option value="nat_results">NAT Results</option>
                                </select>
                              </div>
                              <div>
                                <label className="dropdown-label">Variable 2:</label>
                                <select
                                  className="variable-dropdown"
                                  value={secondCategory}
                                  onChange={(e) => setSecondCategory(e.target.value)}
                                >
                                  <option value="academic_performance">Academic Performance</option>
                                  <option value="nat_results">NAT Results</option>
                                </select>
                              </div>
                            </div>
                            <Bubble
                              data={numericalScatterData}
                              options={{
                                plugins: {
                                  tooltip: { mode: "point" },
                                  legend: { position: "top" },
                                },
                                scales: {
                                  x: { title: { display: true, text: firstCategory } },
                                  y: { title: { display: true, text: secondCategory } },
                                },
                              }}
                            />
                            <div className="insight-container">
                              {numericalInsights}
                            </div>
                          </div>
                        )}

              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Insights;
