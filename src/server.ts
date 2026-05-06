import express from "express";
import cors from "cors";
import { parseInput } from "./parser/inputParser";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/evaluate", (req, res) => {
  const { input } = req.body;

  const result = parseInput(input);

  res.json(result);
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});