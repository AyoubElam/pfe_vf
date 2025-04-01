import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

// Fetch all soutenances
router.get("/", (req, res) => {
  const year = req.query.year;
  let query = `
    SELECT s.idSoutenance, s.date, s.time, s.location, s.status, 
           GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
           GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
           GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
    FROM smart_v.soutenance s
    LEFT JOIN smart_v.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
    LEFT JOIN smart_v.groupe g ON sg.idGroupe = g.idGroupe
    JOIN smart_v.soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
    JOIN smart_v.jury j ON sj.idJury = j.idJury
  `;
  const values = [];
  if (year && year !== "all") {
    query += " WHERE YEAR(s.date) = ?";
    values.push(year);
  }
  query += " GROUP BY s.idSoutenance;";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("❌ Error fetching soutenance data:", err);
      return res.status(500).json({ error: "Failed to fetch soutenance", details: err.sqlMessage });
    }
    res.json(results);
  });
});

// Insert a new soutenance (unchanged, included for completeness)
router.post("/", (req, res) => {
  const { date, time, location, juryIds, groupIds, status } = req.body;
  if (!date || !time || !location || !juryIds || !groupIds || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const querySoutenance = `
    INSERT INTO smart_v.soutenance (date, time, location, status)
    VALUES (?, ?, ?, ?)`;
  const valuesSoutenance = [date, time, location, status];

  db.query(querySoutenance, valuesSoutenance, (err, result) => {
    if (err) {
      console.error("❌ Error inserting soutenance:", err);
      return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    }

    const soutenanceId = result.insertId;

    const juryInsertQuery = `
      INSERT INTO smart_v.soutenance_jury (idSoutenance, idJury) VALUES ?`;
    const juryValues = juryIds.map((idJury) => [soutenanceId, idJury]);

    db.query(juryInsertQuery, [juryValues], (err) => {
      if (err) {
        console.error("❌ Error inserting jury members:", err);
        return res.status(500).json({ error: "Failed to assign jury members", details: err.sqlMessage });
      }

      const groupInsertQuery = `
        INSERT INTO smart_v.soutenance_groupe (idSoutenance, idGroupe) VALUES ?`;
      const groupValues = groupIds.map((idGroupe) => [soutenanceId, idGroupe]);

      db.query(groupInsertQuery, [groupValues], (err) => {
        if (err) {
          console.error("❌ Error inserting groups:", err);
          return res.status(500).json({ error: "Failed to assign groups", details: err.sqlMessage });
        }

        const queryWithDetails = `
          SELECT s.idSoutenance, s.date, s.time, s.location, s.status,
                 GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
                 GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
                 GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
          FROM smart_v.soutenance s
          LEFT JOIN smart_v.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
          LEFT JOIN smart_v.groupe g ON sg.idGroupe = g.idGroupe
          JOIN smart_v.soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
          JOIN smart_v.jury j ON sj.idJury = j.idJury
          WHERE s.idSoutenance = ?
          GROUP BY s.idSoutenance;
        `;

        db.query(queryWithDetails, [soutenanceId], (err, results) => {
          if (err) {
            console.error("❌ Error fetching detailed soutenance data:", err);
            return res.status(500).json({ error: "Failed to fetch detailed soutenance data", details: err.sqlMessage });
          }
          const soutenanceData = results[0];
          res.status(201).json(soutenanceData);
        });
      });
    });
  });
});

// Bulk update soutenance statuses
router.put("/bulk-update", (req, res) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
    return res.status(400).json({ error: "IDs and status are required" });
  }

  const placeholders = ids.map(() => "?").join(", ");
  const query = `
    UPDATE smart_v.soutenance
    SET status = ?
    WHERE idSoutenance IN (${placeholders});
  `;

  db.query(query, [status, ...ids], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Failed to update soutenances" });
    }
    res.json({ message: `Successfully updated ${result.affectedRows} soutenances` });
  });
});

// Get a specific soutenance by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT s.idSoutenance, s.date, s.time, s.location, s.status, 
           GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
           GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
           GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
    FROM smart_v.soutenance s
    LEFT JOIN smart_v.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
    LEFT JOIN smart_v.groupe g ON sg.idGroupe = g.idGroupe
    JOIN smart_v.soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
    JOIN smart_v.jury j ON sj.idJury = j.idJury
    WHERE s.idSoutenance = ?
    GROUP BY s.idSoutenance;
  `;

  db.query(query, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching soutenance:", err);
      return res.status(500).json({ message: "Error fetching soutenance" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: "Soutenance not found" });
    }
    res.json(rows[0]);
  });
});

// Update an existing soutenance
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { date, time, location, status, groupIds, juryIds } = req.body;

  if (!date || !time || !location || !status || !groupIds || !juryIds) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const querySoutenance = `
    UPDATE smart_v.soutenance
    SET date = ?, time = ?, location = ?, status = ?
    WHERE idSoutenance = ?;
  `;
  const valuesSoutenance = [date, time, location, status, id];

  db.query(querySoutenance, valuesSoutenance, (err) => {
    if (err) {
      console.error("❌ Error updating soutenance:", err);
      return res.status(500).json({ error: "Failed to update soutenance" });
    }

    const juryDeleteQuery = `DELETE FROM smart_v.soutenance_jury WHERE idSoutenance = ?`;
    db.query(juryDeleteQuery, [id], (err) => {
      if (err) {
        console.error("❌ Error deleting previous jury members:", err);
        return res.status(500).json({ error: "Failed to delete previous jury members" });
      }

      const juryInsertQuery = `
        INSERT INTO smart_v.soutenance_jury (idSoutenance, idJury) VALUES ?;
      `;
      const juryValues = juryIds.map((idJury) => [id, idJury]);

      db.query(juryInsertQuery, [juryValues], (err) => {
        if (err) {
          console.error("❌ Error inserting new jury members:", err);
          return res.status(500).json({ error: "Failed to assign jury members" });
        }

        const groupDeleteQuery = `DELETE FROM smart_v.soutenance_groupe WHERE idSoutenance = ?`;
        db.query(groupDeleteQuery, [id], (err) => {
          if (err) {
            console.error("❌ Error deleting previous groups:", err);
            return res.status(500).json({ error: "Failed to delete previous groups" });
          }

          const groupInsertQuery = `
            INSERT INTO smart_v.soutenance_groupe (idSoutenance, idGroupe) VALUES ?;
          `;
          const groupValues = groupIds.map((idGroupe) => [id, idGroupe]);

          db.query(groupInsertQuery, [groupValues], (err) => {
            if (err) {
              console.error("❌ Error inserting new groups:", err);
              return res.status(500).json({ error: "Failed to assign groups" });
            }

            const queryWithDetails = `
              SELECT s.idSoutenance, s.date, s.time, s.location, s.status, 
                     GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
                     GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
                     GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
              FROM smart_v.soutenance s
              LEFT JOIN smart_v.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
              LEFT JOIN smart_v.groupe g ON sg.idGroupe = g.idGroupe
              JOIN smart_v.soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
              JOIN smart_v.jury j ON sj.idJury = j.idJury
              WHERE s.idSoutenance = ?
              GROUP BY s.idSoutenance;
            `;
            db.query(queryWithDetails, [id], (err, results) => {
              if (err) {
                console.error("❌ Error fetching updated soutenance data:", err);
                return res.status(500).json({ error: "Failed to fetch updated soutenance data" });
              }
              res.json(results[0]);
            });
          });
        });
      });
    });
  });
});

// Delete a soutenance by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const juryDeleteQuery = `DELETE FROM smart_v.soutenance_jury WHERE idSoutenance = ?`;
  db.query(juryDeleteQuery, [id], (err) => {
    if (err) {
      console.error("❌ Error deleting jury members:", err);
      return res.status(500).json({ error: "Failed to delete jury members" });
    }

    const groupDeleteQuery = `DELETE FROM smart_v.soutenance_groupe WHERE idSoutenance = ?`;
    db.query(groupDeleteQuery, [id], (err) => {
      if (err) {
        console.error("❌ Error deleting groups:", err);
        return res.status(500).json({ error: "Failed to delete groups" });
      }

      const soutenanceDeleteQuery = `DELETE FROM smart_v.soutenance WHERE idSoutenance = ?`;
      db.query(soutenanceDeleteQuery, [id], (err) => {
        if (err) {
          console.error("❌ Error deleting soutenance:", err);
          return res.status(500).json({ error: "Failed to delete soutenance" });
        }
        res.status(200).json({ message: "Soutenance deleted successfully" });
      });
    });
  });
});

// Get groups associated with a jury member if they are an encadrant
router.get("/jury-groups/:idJury", (req, res) => {
  const { idJury } = req.params;
  const query = `
    SELECT DISTINCT g.idGroupe, g.nomGroupe, g.annee, t.nom AS tuteurNom, s.titre AS sujetTitre, e.nom AS encadrantNom
    FROM smart_v.jury j
    JOIN smart_v.encadrant e ON j.idEncadrant = e.idEncadrant
    LEFT JOIN (
        -- Path 1: Groups via Sujet
        SELECT g.idGroupe, g.nomGroupe, g.annee, g.idTuteur, g.idSujet
        FROM smart_v.groupe g
        JOIN smart_v.sujet s ON g.idSujet = s.idSujet
        WHERE s.idEncadrant = (
            SELECT idEncadrant FROM smart_v.jury WHERE idJury = ?
        )
        UNION
        -- Path 2: Groups via Soutenance
        SELECT g.idGroupe, g.nomGroupe, g.annee, g.idTuteur, g.idSujet
        FROM smart_v.groupe g
        JOIN smart_v.soutenance sout ON g.idGroupe = sout.idGroupe
        JOIN smart_v.encadrantsoutenance es ON sout.idSoutenance = es.idSoutenance
        WHERE es.idEncadrant = (
            SELECT idEncadrant FROM smart_v.jury WHERE idJury = ?
        )
        UNION
        -- Path 3: Groups via Evaluation
        SELECT g.idGroupe, g.nomGroupe, g.annee, g.idTuteur, g.idSujet
        FROM smart_v.groupe g
        JOIN smart_v.evaluation eval ON g.idGroupe = eval.idGroupe
        WHERE eval.idEncadrant = (
            SELECT idEncadrant FROM smart_v.jury WHERE idJury = ?
        )
    ) g ON 1=1
    LEFT JOIN smart_v.tuteur t ON g.idTuteur = t.idTuteur
    LEFT JOIN smart_v.sujet s ON g.idSujet = s.idSujet
    WHERE j.idJury = ?;
  `;

  db.query(query, [idJury, idJury, idJury, idJury], (err, results) => {
    if (err) {
      console.error("❌ Error fetching jury groups:", err);
      return res.status(500).json({ error: "Failed to fetch jury groups" });
    }
    res.json(results);
  });
});

export default router;