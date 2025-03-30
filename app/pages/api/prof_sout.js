import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

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

router.get("/soutenances/:id", async (req, res) => {
  const { id } = req.params;
  const { year } = req.query; // Optional year query parameter

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Valid idEncadrant is required" });
  }

  try {
    let query = `
      SELECT 
        s.idSoutenance,
        s.date,
        s.time,
        s.location,
        g.nomGroupe,
        (SELECT GROUP_CONCAT(j.nom SEPARATOR ', ')
         FROM soutenance_jury sj
         INNER JOIN jury j ON sj.idJury = j.idJury
         WHERE sj.idSoutenance = s.idSoutenance) AS juryNames,
        s.status,
        sg.idGroupe
      FROM soutenance s
      INNER JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      INNER JOIN groupe g ON sg.idGroupe = g.idGroupe
      INNER JOIN etudiantgroupe eg ON g.idGroupe = eg.idGroupe
      INNER JOIN etudiantsujet es ON eg.idEtudiant = es.idEtudiant
      INNER JOIN sujet su ON es.idSujet = su.idSujet
      WHERE su.idEncadrant = ?`;
      
    const params = [id];

    // Apply year filter if provided and not set to "all"
    if (year && year !== "all") {
      query += " AND YEAR(s.date) = ?";
      params.push(year);
    }
    
    const results = await queryPromise(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "No soutenances found for this professor" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching soutenances:", error);
    res.status(500).json({ error: "Failed to fetch soutenances", message: error.message });
  }
});

export default router;
