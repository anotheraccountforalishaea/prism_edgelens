import express from "express";
import cors from "cors";
import { runPipeline } from "./index";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/evaluate", (req, res) => {
  const { input } = req.body;

  const result = runPipeline(input);

  res.json(result);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});