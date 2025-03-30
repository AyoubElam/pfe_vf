import express from "express";
import db from "../../../config/db.js"; // Adjust path to your db config

const router = express.Router();

// Helper function to execute queries using Promises
const queryPromise = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

router.get('/', (req, res) => {
  const { idEncadrant } = req.query;

  if (!idEncadrant) {
    return res.status(400).json({ error: "Missing idEncadrant parameter" });
  }

  const query = `
    SELECT 
      pl.id,
      pl.idPFE,
      pl.fichier,
      pl.type,
      g.nomGroupe,
      vc.validationStatus,
      vc.comment
    FROM pfe_livrable pl
    JOIN pfe_groupe pg ON pl.idPFE = pg.idPFE
    JOIN groupe g ON pg.idGroupe = g.idGroupe
    JOIN etudiantgroupe eg ON g.idGroupe = eg.idGroupe
    JOIN etudiantsujet es ON eg.idEtudiant = es.idEtudiant
    JOIN sujet s ON es.idSujet = s.idSujet
    LEFT JOIN validation_comment vc ON pl.idPFE = vc.idPFE AND pl.id = vc.idLivrable AND vc.idEncadrant = ?
    WHERE s.idEncadrant = ? AND pl.fichier IS NOT NULL
    GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, vc.validationStatus, vc.comment
  `;

  db.query(query, [idEncadrant, idEncadrant], (err, results) => {
    if (err) {
      console.error('Error fetching documents:', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
    res.json(results.map(row => ({
      id: row.id,
      idPFE: row.idPFE,
      fichier: row.fichier,
      type: row.type,
      nomGroupe: row.nomGroupe,
      validationStatus: row.validationStatus,
      comment: row.comment
    })));
  });
});

// Submit or update document validation
router.post('/validate_document', async (req, res) => {
  const { idPFE, idLivrable, idEncadrant, validationStatus, comment } = req.body;

  if (!idPFE || !idLivrable || !idEncadrant || !validationStatus) {
    return res.status(400).json({ error: "idPFE, idLivrable, idEncadrant, and validationStatus are required" });
  }

  const upsertQuery = `
    INSERT INTO validation_comment (idPFE, idLivrable, idEncadrant, validationStatus, comment)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      validationStatus = VALUES(validationStatus),
      comment = VALUES(comment)
  `;

  try {
    await queryPromise(upsertQuery, [idPFE, idLivrable, idEncadrant, validationStatus, comment || null]);
    res.status(201).json({ message: "Validation saved successfully" });
  } catch (error) {
    console.error('Error saving validation:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Delete document validation
router.delete('/validate_document', async (req, res) => {
  const { idPFE, idLivrable, idEncadrant } = req.query;

  if (!idPFE || !idLivrable || !idEncadrant) {
    return res.status(400).json({ error: "idPFE, idLivrable, and idEncadrant are required" });
  }

  const deleteQuery = `
    DELETE FROM validation_comment 
    WHERE idPFE = ? AND idLivrable = ? AND idEncadrant = ?
  `;

  try {
    const result = await queryPromise(deleteQuery, [idPFE, idLivrable, idEncadrant]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No validation found to delete" });
    }
    res.json({ message: "Validation deleted successfully" });
  } catch (error) {
    console.error('Error deleting validation:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

export default router;