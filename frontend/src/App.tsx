import { useState, useEffect } from "react";
import { InputForm } from "./components/InputForm";
import { Dashboard } from "./components/Dashboard";
import { evaluateProject, getEnrichment } from "./api/apiClient";
import type { ScoredCandidate, PRISMReport } from "./types/types";

function App() {
  const [report, setReport] = useState<PRISMReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [papersLoading, setPapersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<ScoredCandidate[]>(() => {
    const saved = localStorage.getItem("prism_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    localStorage.setItem("prism_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (candidate: ScoredCandidate) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(b => b.id === candidate.id);
      if (isBookmarked) {
        return prev.filter(b => b.id !== candidate.id);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const handleAnalyze = async (input: string) => {
    setLoading(true);
    setPapersLoading(false);
    setError(null);
    try {
      const data = await evaluateProject(input);
      setReport(data);
      
      if (data.requestId) {
        setPapersLoading(true);
        pollEnrichment(data.requestId);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  const pollEnrichment = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const interval = setInterval(async () => {
      try {
        const data = await getEnrichment(requestId);
        if (data.status === "completed") {
          clearInterval(interval);
          setPapersLoading(false);
          if (data.arxivResults.length > 0) {
            setReport(prev => {
              if (!prev) return null;
              const existingIds = new Set(prev.topResults.map(r => r.id));
              const newResults = data.arxivResults.filter(r => !existingIds.has(r.id));
              return {
                ...prev,
                topResults: [...prev.topResults, ...newResults]
              };
            });
          }
        }
      } catch (err) {
        console.error("Enrichment error:", err);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPapersLoading(false);
      }
    }, 2000);
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    setShowBookmarks(false);
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f1f5f9" }}>
      {!report ? (
        <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h1 style={{ 
              fontSize: "3.5rem", 
              fontWeight: "700", 
              marginBottom: "20px",
              color: "#ffffff",
              letterSpacing: "-0.04em"
            }}>
              EDGE_LENS <span style={{ color: "#3b82f6" }}>Intelligence</span>
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1.125rem", maxWidth: "650px", margin: "0 auto", lineHeight: "1.6" }}>
              Precision Retrieval and Intelligent Scoring Matrix. Analyze hardware-aligned AI candidates for autonomous coding workflows.
            </p>
          </div>
          
          <InputForm onSubmit={handleAnalyze} isLoading={loading} />
          
          {error && (
            <div style={{ 
              color: "#f87171", 
              textAlign: "center", 
              marginTop: "32px",
              padding: "16px",
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              maxWidth: "500px",
              margin: "32px auto"
            }}>
              {error}
            </div>
          )}
        </main>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <header style={{ 
            padding: "16px 32px", 
            borderBottom: "1px solid #1e293b", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "#0f172a",
            zIndex: 10
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>
              EDGE_LENS <span style={{ fontWeight: "400", color: "#94a3b8" }}>Analytics</span>
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => setShowBookmarks(!showBookmarks)}
                style={{
                  backgroundColor: showBookmarks ? "#3b82f6" : "transparent",
                  color: "#ffffff",
                  border: "1px solid #334155",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}
              >
                {showBookmarks ? "Show Results" : `Saved Items (${bookmarks.length})`}
              </button>
              <button 
                onClick={handleReset}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                New Analysis
              </button>
            </div>
          </header>
          
          <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <div style={{ 
                marginBottom: "32px",
                backgroundColor: "#1e293b",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #334155",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px"
              }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Primary Task</label>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>{report.summary.task}</p>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Hardware</label>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>{report.summary.device}</p>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>RAM Constraint</label>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>{report.summary.constraints.memoryMB} MB</p>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Latency SLA</label>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>{report.summary.constraints.latencyMs}ms Target</p>
                </div>
              </div>

              <Dashboard 
                candidates={showBookmarks ? bookmarks : (report.topResults || [])} 
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                isOnlyBookmarks={showBookmarks}
              />

              {papersLoading && (
                <div style={{ 
                  margin: "24px 0",
                  padding: "12px", 
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  textAlign: "center",
                  color: "#60a5fa",
                  fontSize: "0.875rem"
                }}>
                  Secondary enrichment active: retrieving research literature...
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginTop: "32px" }}>
                <section style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "16px", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6" }}></div>
                    Strategic Insights
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {report.trendInsights.map((insight, i) => (
                      <div key={i} style={{ fontSize: "0.9375rem", color: "#94a3b8", lineHeight: "1.5", paddingLeft: "16px", borderLeft: "1px solid #334155" }}>
                        {insight}
                      </div>
                    ))}
                  </div>
                </section>
                <section style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "16px", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }}></div>
                    Architecture Suggestions
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {report.suggestions.map((suggestion, i) => (
                      <div key={i} style={{ fontSize: "0.9375rem", color: "#94a3b8", lineHeight: "1.5", paddingLeft: "16px", borderLeft: "1px solid #334155" }}>
                        {suggestion}
                      </div>
                    ))}
                  </div>
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