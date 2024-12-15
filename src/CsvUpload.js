import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";  
import { db } from "./firebase";  

const CsvUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("Please upload a valid CSV file.");
      return;
    }
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
        setError(null);
      },
      header: true,  // Use the first row as the header
      skipEmptyLines: true,
    });
  };

  const saveToDatabase = async () => {
    if (csvData.length === 0) {
      setError("No data to save. Please upload a CSV file.");
      return;
    }

    setLoading(true);
    try {
      const natCollection = collection(db, "natData");
      for (const row of csvData) {
        // Destructure and map the NAT dataset fields
        const { Respondents, Age, sex, Ethnic, academic_performance, academic_description, IQ, type_school, socio_economic_status, Study_Habit, NAT_Results } = row;

        // IQ is treated as a description (text/string) instead of a number
        await addDoc(natCollection, {
          respondents: Respondents,
          age: Number(Age),
          sex: sex,
          ethnic: Ethnic,
          academic_performance: academic_performance,
          academic_description: academic_description,
          iq: IQ,  // Treat IQ as a description
          type_of_school: type_school,
          socio_economic_status: socio_economic_status,
          study_habit: Study_Habit,
          nat_results: Number(NAT_Results)
        });
      }
      alert("Data saved successfully!");
    } catch (err) {
      console.error("Error saving data: ", err);
      setError("Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()} className="custom-file-upload">
        Choose File
      </button>

      {csvData.length > 0 && (
        <>
          <br />
          <button onClick={saveToDatabase} disabled={loading} className="save-button">
            {loading ? "Saving Data..." : "Save to Database"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CsvUpload;
