import { useState } from "react";
import { InputForm } from "./components/InputForm";
import { Dashboard } from "./components/Dashboard";
import { evaluateProject } from "./api/apiClient";
import type { ScoredCandidate, PRISMReport } from "./types/types";

function App() {
  const [report, setReport] = useState<PRISMReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (input: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateProject(input);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze project");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div style={{ 
      backgroundColor: "#030712", 
      minHeight: "100vh", 
      color: "white",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    }}>
      {!report ? (
        <div style={{ padding: "80px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ 
              fontSize: "4rem", 
              fontWeight: "800", 
              marginBottom: "16px",
              background: "linear-gradient(135deg, #818cf8, #c084fc, #fb7185)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.05em"
            }}>
              EDGE_LENS
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>
              The Precision Retrieval and Intelligent Scoring Matrix. 
              Find the perfect AI models, repos, and papers for your edge constraints.
            </p>
          </div>
          
          <InputForm onSubmit={handleAnalyze} isLoading={loading} />
          
          {error && (
            <div style={{ 
              color: "#ef4444", 
              textAlign: "center", 
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              maxWidth: "400px",
              margin: "20px auto"
            }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <header style={{ 
            padding: "20px 40px", 
            borderBottom: "1px solid #1f2937", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "#111827"
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold",
              background: "linear-gradient(135deg, #818cf8, #c084fc, #fb7185)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              EDGE_LENS
            </h2>
            <button 
              onClick={handleReset}
              style={{
                backgroundColor: "#374151",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              New Search
            </button>
          </header>
          
          <div style={{ padding: "40px" }}>
            <div style={{ 
              maxWidth: "1280px", 
              margin: "0 auto", 
              marginBottom: "40px",
              backgroundColor: "rgba(31, 41, 55, 0.5)",
              padding: "32px",
              borderRadius: "24px",
              border: "1px solid rgba(75, 85, 99, 0.3)"
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#e5e7eb" }}>Project Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "4px" }}>Task</p>
                  <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>{report.summary.task}</p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "4px" }}>Target Device</p>
                  <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>{report.summary.device}</p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "4px" }}>Memory Limit</p>
                  <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>{report.summary.constraints.memoryMB} MB</p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "4px" }}>Latency Goal</p>
                  <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>&lt; {report.summary.constraints.latencyMs} ms</p>
                </div>
              </div>
            </div>

            <Dashboard candidates={report.topResults} />

            <div style={{ maxWidth: "1280px", margin: "40px auto 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                <section>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "16px", color: "#f3f4f6" }}>Trend Insights</h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {report.trendInsights.map((insight, i) => (
                      <li key={i} style={{ 
                        padding: "12px 16px", 
                        backgroundColor: "#1f2937", 
                        borderRadius: "12px", 
                        marginBottom: "8px",
                        borderLeft: "4px solid #818cf8"
                      }}>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "16px", color: "#f3f4f6" }}>Suggestions</h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {report.suggestions.map((suggestion, i) => (
                      <li key={i} style={{ 
                        padding: "12px 16px", 
                        backgroundColor: "#1f2937", 
                        borderRadius: "12px", 
                        marginBottom: "8px",
                        borderLeft: "4px solid #fb7185"
                      }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;