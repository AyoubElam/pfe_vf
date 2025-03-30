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

router.get("/group-only/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    const query = `
      SELECT 
        s.idSoutenance,
        s.date,
        s.time,
        s.location,
        s.status,
        sg.idGroupe,
        g.nomGroupe,
        GROUP_CONCAT(j.nom ORDER BY j.nom ASC SEPARATOR ', ') AS juryNames
      FROM soutenance s
      INNER JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      INNER JOIN groupe g ON sg.idGroupe = g.idGroupe
      LEFT JOIN soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      LEFT JOIN jury j ON sj.idJury = j.idJury
      WHERE sg.idGroupe = ?
      GROUP BY s.idSoutenance, sg.idGroupe, g.nomGroupe;
    `;

    const results = await queryPromise(query, [groupId]);
    console.log("Raw database results:", results); // Debug log

    const soutenances = results.map(row => ({
      idSoutenance: row.idSoutenance,
      date: row.date,
      time: row.time,
      location: row.location,
      status: row.status,
      idGroupe: row.idGroupe,
      nomGroupe: row.nomGroupe,
      juryNames: row.juryNames // Add this line
    }));

    console.log("Mapped soutenances:", soutenances); // Debug log
    res.json(soutenances);
  } catch (error) {
    console.error("Error fetching soutenances:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;