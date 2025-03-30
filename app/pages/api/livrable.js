/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import multer from "multer";
import db from "../../../config/db.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});
const upload = multer({ storage });

router.get("/documents", (req, res) => {
  const { idEtudiant } = req.query;
  if (!idEtudiant) {
    return res.status(400).send("Missing idEtudiant");
  }

  const query = `
    SELECT
      pl.id,
      pl.idPFE,
      pl.fichier,
      pl.type,
      vt.validationStatus AS tutorValidationStatus,
      vt.comment AS tutorComment,
      vt.idTuteur AS tutorId,
      vp.validationStatus AS profValidationStatus,
      vp.comment AS profComment,
      vp.idEncadrant AS profId
    FROM pfe_livrable pl
    JOIN pfe_groupe pg ON pl.idPFE = pg.idPFE
    JOIN etudiantgroupe eg ON pg.idGroupe = eg.idGroupe
    LEFT JOIN validation_comment vt ON pl.idPFE = vt.idPFE AND pl.id = vt.idLivrable AND vt.idTuteur IS NOT NULL AND vt.idEncadrant IS NULL
    LEFT JOIN validation_comment vp ON pl.idPFE = vp.idPFE AND pl.id = vp.idLivrable AND vp.idEncadrant IS NOT NULL AND vp.idTuteur IS NULL
    WHERE eg.idEtudiant = ?
  `;

  db.query(query, [idEtudiant], (err, rows) => {
    if (err) {
      console.error("Error fetching documents:", err);
      return res.status(500).send("Server error");
    }

    const documents = rows.map((row) => ({
      id: row.id,
      idPFE: row.idPFE,
      fichier: row.fichier,
      type: row.type,
      tutorValidation: row.tutorValidationStatus
        ? { validationStatus: row.tutorValidationStatus, comment: row.tutorComment }
        : null,
      profValidation: row.profValidationStatus
        ? { validationStatus: row.profValidationStatus, comment: row.profComment }
        : null,
    }));

    res.json(documents);
  });
});
router.post("/submit-documents", upload.array("files"), (req, res) => {
  const { idEtudiant, idGroupe } = req.body;
  const files = req.files;

  if (!idEtudiant || !idGroupe || !files || files.length === 0) {
    return res.status(400).send("Missing required fields or files");
  }

  db.query(
    "SELECT 1 FROM etudiantgroupe WHERE idEtudiant = ? AND idGroupe = ?",
    [idEtudiant, idGroupe],
    (err, authRows) => {
      if (err) return res.status(500).send(`Server error: ${err.message}`);
      if (authRows.length === 0) return res.status(403).send("Unauthorized");

      db.query("SELECT idPFE FROM pfe_groupe WHERE idGroupe = ?", [idGroupe], (err, pfeRows) => {
        if (err) return res.status(500).send(`Server error: ${err.message}`);
        if (pfeRows.length === 0) return res.status(404).send("PFE not found for this group");
        const idPFE = pfeRows[0].idPFE;

        let insertsCompleted = 0;
        const totalInserts = files.length;

        files.forEach((file, index) => {
          const filePath = `/uploads/${file.filename}`;
          const fileType = index === 0 ? "PDF" : "Presentation";

          db.query(
            "INSERT INTO pfe_livrable (idPFE, fichier, type) VALUES (?, ?, ?)",
            [idPFE, filePath, fileType],
            (err) => {
              if (err) return res.status(500).send(`Server error: ${err.message}`);
              insertsCompleted++;
              if (insertsCompleted === totalInserts) res.send("Documents submitted successfully.");
            }
          );
        });
      });
    }
  );
});

router.post("/delete-document", (req, res) => {
  const { idEtudiant, idPFE, id } = req.body;

  if (!idEtudiant || !idPFE || !id) return res.status(400).send("Missing required fields");

  db.query(
    "SELECT 1 FROM etudiantgroupe eg JOIN pfe_groupe pg ON eg.idGroupe = pg.idGroupe WHERE eg.idEtudiant = ? AND pg.idPFE = ?",
    [idEtudiant, idPFE],
    (err, authRows) => {
      if (err) return res.status(500).send(`Server error: ${err.message}`);
      if (authRows.length === 0) return res.status(403).send("Unauthorized");

      db.query("SELECT fichier FROM pfe_livrable WHERE idPFE = ? AND id = ?", [idPFE, id], (err, rows) => {
        if (err) return res.status(500).send(`Server error: ${err.message}`);
        if (rows.length === 0) return res.status(404).send("Document not found");

        const filePath = rows[0].fichier;
        if (filePath) {
          const filename = path.basename(filePath);
          const fullPath = path.join(__dirname, "..", "uploads", filename);
          fs.unlink(fullPath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        db.query("DELETE FROM pfe_livrable WHERE idPFE = ? AND id = ?", [idPFE, id], (err, result) => {
          if (err) return res.status(500).send(`Server error: ${err.message}`);
          if (result.affectedRows === 0) return res.status(404).send("Document not found");
          res.send("Document deleted successfully.");
        });
      });
    }
  );
});

export default router;