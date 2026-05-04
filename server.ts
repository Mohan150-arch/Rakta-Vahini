import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Donor, BloodGroup } from "./src/types";
import { MOCK_DONORS } from "./src/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (For Android Retrofit) ---

  // Database in-memory for this session
  let database: Donor[] = [...MOCK_DONORS];

  // 1. Get all donors (with optional blood group filter)
  app.get("/api/donors", (req, res) => {
    const { bloodGroup } = req.query;
    if (bloodGroup) {
      return res.json(database.filter(d => d.bloodGroup === bloodGroup));
    }
    res.json(database);
  });

  // 2. Register new donor
  app.post("/api/donors", (req, res) => {
    const newDonor: Donor = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body
    };
    database.push(newDonor);
    res.status(201).json(newDonor);
  });

  // 3. Update ready-to-donate status
  app.patch("/api/donors/:id/status", (req, res) => {
    const { id } = req.params;
    const { isReady } = req.body;
    const donor = database.find(d => d.id === id);
    if (donor) {
      donor.isReady = isReady;
      return res.json(donor);
    }
    res.status(404).json({ error: "Donor not found" });
  });

  // --- Vite Middleware for Web UI ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
