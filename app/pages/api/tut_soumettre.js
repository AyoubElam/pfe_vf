import express from "express";
const router = express.Router();
import db from "../../../config/db.js";

// tut_soumettre.js
// tut_soumettre.js
router.get("/group-documents", (req, res) => {
  const { idTuteur } = req.query;

  if (!idTuteur) {
    return res.status(400).json({ error: "Missing idTuteur parameter" });
  }

  const query = `
    SELECT 
      pl.id,
      pl.idPFE,
      pl.fichier,
      pl.type,
      g.nomGroupe,
      COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
      pl.idLivrable,
      vc.validationStatus,
      vc.comment,
      GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames
    FROM pfe_livrable pl
    JOIN pfe p ON pl.idPFE = p.idPFE
    JOIN groupe g ON pl.idGroupe = g.idGroupe AND p.idGroupe = g.idGroupe
    LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
    LEFT JOIN validation_comment vc ON pl.id = vc.pfeLivrableId AND vc.idTuteur = ?
    WHERE p.idTuteur = ?
    GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, pl.idLivrable, vc.validationStatus, vc.comment;
  `;

  db.query(query, [idTuteur, idTuteur], (err, results) => {
    if (err) {
      console.error("Error fetching documents:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }

    console.log("Raw query results:", JSON.stringify(results, null, 2)); // Debug log

    const uniqueResults = results.map((row) => ({
      id: row.id,
      idPFE: row.idPFE,
      fichier: row.fichier,
      type: row.type,
      nomGroupe: row.nomGroupe,
      nbEtudiants: row.nbEtudiants,
      idLivrable: row.idLivrable || null,
      validationStatus: row.validationStatus || "pending",
      comment: row.comment,
      authorName: row.studentNames,
    }));

    res.json(uniqueResults);
  });
});

export default router;