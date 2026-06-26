import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import errorRoutes from "./routes/errorRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { error: "Too many analyze requests, slow down" },
});

app.use("/api/analyze", analyzeLimiter, analyzeRoutes);
app.use("/api/errors", errorRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));