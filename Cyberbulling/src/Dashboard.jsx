import React, { useState } from "react";
import "./dashboard.css";

const Dashboard = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [dataScores, setDataScores] = useState(null);


 /*  const analyzeContent = async () => {
    if (!text.trim()) {
      alert("Please enter text");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await res.json();
      console.log("FULL RESPONSE:", data);
     console.log("RESULTS ONLY:", data.results);
      console.log("CONFIDENCE:", data.confidence);

      setResults(data.results);
      setConfidence(data.confidence);
    } catch (error) {
      alert("Backend not running");
    }

    setLoading(false);
  }; */
const analyzeContent = async () => {
  setLoading(true);
  if (text.trim()) {
    // TEXT REQUEST
     
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    console.log("FULL RESPONSE:", data);
     console.log("RESULTS ONLY:", data.binary_results);
      console.log("CONFIDENCE:", data.confidence);
      console.log("scores",data.scores)
    setResults(data.binary_results);
    setConfidence(data.confidence);
    setDataScores(data.scores);

  } 
  else if (audioFile) {
    // AUDIO REQUEST
    const formData = new FormData();
    formData.append("audio", audioFile);

    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("FULL RESPONSE:", data);
     console.log("RESULTS ONLY:", data.binary_results);
      console.log("CONFIDENCE:", data.confidence);
      console.log("Transcripted Data",data.transcribed_text); 
    setResults(data.binary_results);
    setConfidence(data.confidence);
    setText(data.transcribed_text); // show transcription
    setDataScores(data.scores);

  }
   setLoading(false);
};

  return (
    <div className="container">
      <header className="topbar">
        <h2>Cyberbullying Forensics Dashboard</h2>
        <span className="tag">Multilingual Text & Audio Analysis</span>
      </header>

      <div className="content">
        {/* Input Section */}
        <div className="card">
          <h3>Input Content</h3>

          <textarea
            placeholder="Enter text or transcript here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <br />
          <span>---or---</span>
          <br />
          <br />

          <h3>Choose Any Audio File</h3>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
            />


          <button className="analyze-btn" onClick={analyzeContent}>
            {loading ? "Analyzing..." : "Analyze Content"}
          </button>
        </div>

        {/* Result Section */}
        {results && (
          <div className="card">
            <h3>Analysis Results</h3>

            {Object.entries(results).map(([key, value]) => (
              <div className="result" key={key}>
                <span>{key.replace("_", " ")}</span>
                <span className={value ? "yes" : "no"}>
                   {value ? "Yes" : "No"}
                </span>
              </div>
            ))}

            <h4>Exact Probability Scores</h4>
              {Object.entries(dataScores).map(([key, val]) => (
                <div className="result" key={key}>
                  <span>{key.replace("_", " ")}</span>
                  <span>{(val * 100).toFixed(2)}%</span>
                </div>
              ))}
            <p className="confidence">
              Confidence Score: <b>{confidence}%</b>
            </p>
          </div>
        )}

        {/* Explainable AI */}
        {results && (
          <div className="card">
            <h3>Explainable AI (XAI)</h3>
            <p>
              Detected offensive terms are highlighted to explain model
              decisions.
            </p>

            <div className="highlight">
              {text}
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        © 2025 Cyberbullying Forensics | Academic Project
      </footer>
    </div>
  );
};

export default Dashboard;
