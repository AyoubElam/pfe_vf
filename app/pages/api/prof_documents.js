import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

// GET documents for professor
router.get("/", (req, res) => {
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
      COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
      GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames,
      s.titre AS subjectTitle,
      vc.validationStatus,
      vc.comment,
      pl.idLivrable
    FROM pfe_livrable pl
    JOIN groupe g ON pl.idGroupe = g.idGroupe
    JOIN sujet s ON g.idSujet = s.idSujet
    LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
    LEFT JOIN validation_comment vc ON pl.id = vc.pfeLivrableId AND vc.idEncadrant = ?
    WHERE s.idEncadrant = ?
    GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, s.titre, vc.validationStatus, vc.comment, pl.idLivrable;
  `;

  console.log("Executing query:", query);
  console.log("Parameters:", [idEncadrant, idEncadrant]);

  db.query(query, [idEncadrant, idEncadrant], (err, results) => {
    if (err) {
      console.error("Error fetching documents:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
    
    console.log("Query results:", results);
    
    const documents = results.map((row) => ({
      id: row.id,
      idPFE: row.idPFE,
      fichier: row.fichier,
      type: row.type,
      nomGroupe: row.nomGroupe,
      nbEtudiants: row.nbEtudiants,
      authorName: row.studentNames,
      subjectTitle: row.subjectTitle,
      validationStatus: row.validationStatus || "pending",
      comment: row.comment,
      idLivrable: row.idLivrable
    }));
    
    res.json(documents);
  });
});

// POST route for professor to validate documents
router.post("/validate", (req, res) => {
  const { idPFE, pfeLivrableId, idEncadrant, validationStatus, comment } = req.body;
  console.log("Received validation request:", req.body);

  if (!idPFE || !pfeLivrableId || !idEncadrant || !validationStatus) {
    console.log("Missing fields:", { idPFE, pfeLivrableId, idEncadrant, validationStatus });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const validateQuery = `
    INSERT INTO validation_comment (idPFE, pfeLivrableId, idEncadrant, validationStatus, comment)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      validationStatus = VALUES(validationStatus),
      comment = VALUES(comment)
  `;

  db.query(validateQuery, [idPFE, pfeLivrableId, idEncadrant, validationStatus, comment || null], (err, result) => {
    if (err) {
      console.error("Validation insert/update error:", err);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
    console.log("Query result:", result);
    res.json({
      message: result.affectedRows > 0 
        ? (result.insertId ? "Validation created successfully" : "Validation updated successfully") 
        : "No changes made",
    });
  });
});

// DELETE route for professor to remove validation
router.delete("/validate", (req, res) => {
  const { idPFE, pfeLivrableId, idEncadrant } = req.query;

  if (!idPFE || !pfeLivrableId || !idEncadrant) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const deleteQuery = `
    DELETE FROM validation_comment
    WHERE idPFE = ? AND pfeLivrableId = ? AND idEncadrant = ?
  `;

  db.query(deleteQuery, [idPFE, pfeLivrableId, idEncadrant], (err, result) => {
    if (err) {
      console.error("Error deleting validation:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Validation not found" });
    }

    return res.json({ message: "Validation deleted successfully" });
  });
});

export default router;
