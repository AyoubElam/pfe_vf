/* eslint-disable @typescript-eslint/no-unused-vars */
// src/server.js
import express from "express";
import path from "path";
import cors from "cors";
import db from "./config/db.js";

// Import routers
import profRoutes from "./routers/profRoutes.js";
import tutorRoutes from "./routers/tutorRoutes.js";
import studentRoutes from "./routers/studentRoutes.js";
import validationRoutes from "./routers/validationRoutes.js";
import soutenanceRoutes from "./routers/soutenanceRoutes.js";
import documentRoutes from "./routers/documentRouter.js";
import juryRoutes from "./routers/juryRouter.js";
import groupRoutes from "./routers/groupRouter.js";
import evaluationRoutes from "./routers/evaluationRoutes.js"; // Updated import

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const PDF_DIR = path.join(process.cwd(), "generated-pdfs"); // New PDF directory

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(UPLOADS_DIR));

// API Routes
const API_PREFIX = "/api";
const routes = [
  { path: `${API_PREFIX}/prof`, router: profRoutes },
  { path: `${API_PREFIX}/tutor`, router: tutorRoutes },
  { path: `${API_PREFIX}/etu`, router: studentRoutes },
  { path: `${API_PREFIX}/validate_document`, router: validationRoutes },
  { path: `${API_PREFIX}/soutenance`, router: soutenanceRoutes },
  { path: `${API_PREFIX}/documents`, router: documentRoutes },
  { path: `${API_PREFIX}/jurys`, router: juryRoutes },
  { path: `${API_PREFIX}/groups`, router: groupRoutes },
  { path: `${API_PREFIX}/evaluation`, router: evaluationRoutes } // Using the new routes
];

routes.forEach(({ path, router }) => {
  app.use(path, router);
  console.log(`Registered routes for ${path}`);
});

// Health check
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() ,
    pdfDirectory: PDF_DIR // Include in health check
  });
});

// Not found handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: "Not Found",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  if (process.env.NODE_ENV !== "production") {
    return res.status(statusCode).json({ 
      error: message,
      stack: err.stack,
      details: err.details
    });
  }
  
  res.status(statusCode).json({ error: message });
});

// Server startup
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${UPLOADS_DIR}`);
  console.log(`📄 PDF storage directory: ${PDF_DIR}`); // New log 
  console.log(`🌐 CORS allowed origin: ${CORS_ORIGIN}`);
  
});

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});