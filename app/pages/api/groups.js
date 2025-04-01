import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const query = `
    SELECT 
      g.idGroupe, 
      g.nomGroupe, 
      COUNT(e.idEtudiant) AS nbEtudiants,
      GROUP_CONCAT(CONCAT(e.prenom, ' ', e.nom) SEPARATOR ', ') AS students
    FROM groupe g
    LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
    GROUP BY g.idGroupe, g.nomGroupe;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups data:", err);
      return res.status(500).json({ error: "Failed to fetch groups", details: err.sqlMessage });
    }

    // Transform results into a structured format
    const formattedResults = results.map((row) => ({
      idGroupe: row.idGroupe.toString(), // Convert to string if needed (depends on your schema)
      nomGroupe: row.nomGroupe,
      nbEtudiants: row.nbEtudiants,
      students: row.students ? row.students.split(", ") : [], // Split names into an array
    }));

    res.json(formattedResults);
  });
});

export default router;