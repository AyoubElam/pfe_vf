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
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});
const upload = multer({ storage });

// Fetch documents for a student
router.get("/documents", (req, res) => {
  const { idEtudiant } = req.query;
  if (!idEtudiant) return res.status(400).send("Missing idEtudiant");

  const query = `
    SELECT
      pl.id,
      pl.idPFE,
      pl.fichier,
      pl.type,
      g.nomGroupe,
      COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
      vt.validationStatus AS tutorValidationStatus,
      vt.comment AS tutorComment,
      vp.validationStatus AS profValidationStatus,
      vp.comment AS profComment,
      pl.idLivrable
    FROM pfe_livrable pl
    JOIN pfe p ON pl.idPFE = p.idPFE
    JOIN groupe g ON pl.idGroupe = g.idGroupe AND p.idGroupe = g.idGroupe
    JOIN etudiant e ON g.idGroupe = e.idGroupe
    LEFT JOIN validation_comment vt ON pl.id = vt.pfeLivrableId AND vt.idTuteur IS NOT NULL
    LEFT JOIN validation_comment vp ON pl.id = vp.pfeLivrableId AND vp.idEncadrant IS NOT NULL
    WHERE e.idEtudiant = ?
    GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, pl.idLivrable;
  `;

  db.query(query, [idEtudiant], (err, rows) => {
    if (err) return res.status(500).send(`Server error: ${err.message}`);

    const documents = rows.map((row) => ({
      id: row.id,
      idPFE: row.idPFE,
      fichier: row.fichier,
      type: row.type,
      nomGroupe: row.nomGroupe,
      nbEtudiants: row.nbEtudiants,
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
    "SELECT idGroupe FROM etudiant WHERE idEtudiant = ? AND idGroupe = ?",
    [idEtudiant, idGroupe],
    (err, authRows) => {
      if (err) return res.status(500).send(`Server error: ${err.message}`);
      if (authRows.length === 0) return res.status(403).send("Unauthorized");

      db.query("SELECT idPFE, annee FROM pfe WHERE idGroupe = ?", [idGroupe], (err, pfeRows) => {
        if (err) return res.status(500).send(`Server error: ${err.message}`);
        if (pfeRows.length === 0) return res.status(404).send("PFE not found");

        const idPFE = pfeRows[0].idPFE;
        const annee = pfeRows[0].annee;

        let insertsCompleted = 0;
        const totalInserts = files.length;

        files.forEach((file) => {
          const filePath = `/uploads/${file.filename}`;
          const extension = path.extname(file.originalname).toLowerCase();
          const fileType = extension === ".pdf" ? "PDF" : "Presentation";
          const fileNom = file.originalname;

          db.query(
            "SELECT idLivrable FROM livrable WHERE type = ? AND annee = ? LIMIT 1",
            [fileType, annee],
            (err, livrableRows) => {
              if (err) return res.status(500).send(`Server error: ${err.message}`);

              let idLivrable;
              if (livrableRows.length > 0) {
                idLivrable = livrableRows[0].idLivrable;
              } else {
                db.query(
                  "INSERT INTO livrable (type, nom, annee) VALUES (?, ?, ?)",
                  [fileType, fileNom, annee],
                  (err, livrableResult) => {
                    if (err) return res.status(500).send(`Server error: ${err.message}`);
                    idLivrable = livrableResult.insertId;
                    insertPfeLivrable(idLivrable);
                  }
                );
                return;
              }
              insertPfeLivrable(idLivrable);
            }
          );

          function insertPfeLivrable(idLivrable) {
            db.query(
              "INSERT INTO pfe_livrable (idPFE, idGroupe, fichier, type, idLivrable) VALUES (?, ?, ?, ?, ?)",
              [idPFE, idGroupe, filePath, fileType, idLivrable],
              (err, result) => {
                if (err) return res.status(500).send(`Server error: ${err.message}`);
                insertsCompleted++;
                if (insertsCompleted === totalInserts) {
                  res.send("Documents submitted successfully.");
                }
              }
            );
          }
        });
      });
    }
  );
});

// Delete document
router.post("/delete-document", (req, res) => {
  const { idEtudiant, idPFE, id } = req.body;

  if (!idEtudiant || !idPFE || !id) {
    return res.status(400).send("Missing required fields");
  }

  db.query(
    "SELECT e.idGroupe FROM etudiant e JOIN pfe p ON e.idGroupe = p.idGroupe WHERE e.idEtudiant = ? AND p.idPFE = ?",
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
          try {
            fs.unlinkSync(fullPath);
          } catch (fileErr) {
            console.error("Error deleting file (continuing anyway):", fileErr);
          }
        }

        // Delete pfe_livrable (validations auto-deleted via CASCADE)
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