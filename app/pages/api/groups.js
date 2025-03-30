import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const query = `
    SELECT 
      g.idGroupe, 
      g.nomGroupe, 
      COUNT(eg.idEtudiant) AS nbEtudiants,
      GROUP_CONCAT(CONCAT(e.prenom, ' ', e.nom) SEPARATOR ', ') AS students
    FROM groupe g
    LEFT JOIN etudiantgroupe eg ON g.idGroupe = eg.idGroupe
    LEFT JOIN etudiant e ON eg.idEtudiant = e.idEtudiant
    GROUP BY g.idGroupe, g.nomGroupe;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups data:", err);
      return res.status(500).json({ error: "Failed to fetch groups" });
    }

    // Transform results into a structured format
    const formattedResults = results.map((row) => ({
      idGroupe: row.idGroupe.toString(), // Convert to string if needed
      nomGroupe: row.nomGroupe,
      nbEtudiants: row.nbEtudiants,
      students: row.students ? row.students.split(", ") : [], // Split names into an array
    }));

    res.json(formattedResults);
  });
});

export default router;