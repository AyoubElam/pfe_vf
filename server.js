/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import path from "path";
import cors from "cors";
import db from "./config/db.js";

// Import refactored routers
import juryRouter from "./routers/juryRouter.js";
import groupRouter from "./routers/groupRouter.js";
import soutenanceRouter from "./routers/soutenanceRouter.js";
import documentRouter from "./routers/documentRouter.js";
import validationRouter from "./routers/validationRouter.js";

// Legacy routes (to be phased out)
import etu_sout from "./app/pages/api/etu_sout.js";
import livrable from "./app/pages/api/livrable.js";
import tut_sout from "./app/pages/api/tut_sout.js";
import tut_soumettre from "./app/pages/api/tut_soumettre.js";
import validate_document from "./app/pages/api/validate_document.js";
import prof_sout from "./app/pages/api/prof_sout.js";
import profDocuments from "./app/pages/api/prof_documents.js";
import evaluation from "./app/pages/api/evaluation.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Register API Routes
app.use("/api/jurys", juryRouter);
app.use("/api/groups", groupRouter);
app.use("/api/soutenance", soutenanceRouter);
app.use("/api/livrable", documentRouter);
app.use("/api/validate_document", validationRouter);
app.use("/api", evaluationRouter);

// Legacy routes (to be refactored)
app.use("/api/etu_sout", etu_sout);
app.use("/api/livrable", livrable);
app.use("/api/soutenances", tut_sout);
app.use("/api/tut_soumettre", tut_soumettre);
app.use("/api/validate_document", validate_document);
app.use("/api/prof_sout", prof_sout);
app.use("/api/prof-documents", profDocuments);
app.use("/api", evaluation);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});