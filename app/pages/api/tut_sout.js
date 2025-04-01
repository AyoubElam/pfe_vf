import express from "express";
import db from "../../../config/db.js";


const router = express.Router();

const queryPromise = (query, params) => {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        console.error("Failed to reconnect to database:", err);
        return reject(err);
      }
      db.query(query, params, (error, results) => {
        if (error) {
          console.error("Query error:", error);
          return reject(error);
        }
        resolve(results);
      });
    });
  });
};

router.get("/tuteur/:idTuteur", async (req, res) => {
  const { idTuteur } = req.params;

  if (!idTuteur) {
    return res.status(400).json({ error: "Missing idTuteur" });
  }

  try {
    const query = `
      SELECT 
        s.idSoutenance,
        DATE(s.date) AS date,
        s.time,
        s.location,
        s.status,
        g.idGroupe,
        g.nomGroupe,
        j.nom AS juryNom
      FROM 
        soutenance s
      INNER JOIN 
        soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      INNER JOIN 
        groupe g ON sg.idGroupe = g.idGroupe
      INNER JOIN 
        pfe p ON g.idGroupe = p.idGroupe  -- Use pfe.idGroupe instead of pfe_groupe
      LEFT JOIN 
        soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      LEFT JOIN 
        jury j ON sj.idJury = j.idJury
      WHERE 
        p.idTuteur = ?;
    `;
    const results = await queryPromise(query, [idTuteur]);

    // Aggregate jury names by soutenance
    const soutenancesMap = new Map();
    results.forEach((row) => {
      const { idSoutenance } = row;
      if (!soutenancesMap.has(idSoutenance)) {
        soutenancesMap.set(idSoutenance, {
          idSoutenance: row.idSoutenance,
          date: row.date,
          time: row.time,
          location: row.location,
          status: row.status,
          idGroupe: row.idGroupe,
          nomGroupe: row.nomGroupe,
          juryNames: [],
        });
      }
      if (row.juryNom) {
        soutenancesMap.get(idSoutenance).juryNames.push(row.juryNom);
      }
    });

    const soutenances = Array.from(soutenancesMap.values());
    res.json(soutenances);
  } catch (error) {
    console.error("Error fetching soutenances:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Unknown error",
    });
  }
});

export default router;