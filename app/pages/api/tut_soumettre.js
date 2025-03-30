import express from "express";
const router = express.Router();
import db from "../../../config/db.js"; // Adjust path as needed

router.get('/group-documents', (req, res) => {
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
      vc.validationStatus,
      vc.comment,
      GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames
    FROM pfe_livrable pl
    JOIN pfe p ON pl.idPFE = p.idPFE
    JOIN pfe_groupe pg ON pl.idPFE = pg.idPFE
    JOIN groupe g ON pg.idGroupe = g.idGroupe
    JOIN etudiantgroupe eg ON g.idGroupe = eg.idGroupe
    JOIN etudiant e ON eg.idEtudiant = e.idEtudiant
    LEFT JOIN validation_comment vc ON pl.idPFE = vc.idPFE AND pl.id = vc.idLivrable AND vc.idTuteur = ?
    WHERE p.idTuteur = ? AND pl.fichier IS NOT NULL
    GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, vc.validationStatus, vc.comment
  `;

  db.query(query, [idTuteur, idTuteur], (err, results) => {
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
      comment: row.comment,
      authorName: row.studentNames
    })));
  });
});

export default router;