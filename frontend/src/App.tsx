import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleClick = async () => {
    const res = await fetch("http://localhost:3000/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input: text })
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PRISM</h1>

      <textarea
        placeholder="Describe your AI project..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "300px", height: "100px" }}
      />

      <br /><br />

      <button onClick={handleClick}>Analyze</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;