import express from "express";
import db from "../../../config/db.js";

const router = express.Router();

// Fetch all soutenances with groupIds included, with optional year filter
router.get("/", (req, res) => {
  const year = req.query.year; // Get the year query parameter if provided
  let query = `
    SELECT s.idSoutenance, s.date, s.time, s.location, s.status, 
           GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
           GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
           GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
    FROM soutenance s
    LEFT JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
    LEFT JOIN groupe g ON sg.idGroupe = g.idGroupe
    JOIN soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
    JOIN jury j ON sj.idJury = j.idJury
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
      return res.status(500).json({ error: "Failed to fetch soutenance" });
    }
    res.json(results);
  });
});

// Insert a new soutenance
router.post("/", (req, res) => {
  const { date, time, location, juryIds, groupIds, status } = req.body;
  console.log("Received data:", req.body);

  if (!date || !time || !location || !juryIds || !groupIds || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const querySoutenance = `
    INSERT INTO soutenance (date, time, location, status)
    VALUES (?, ?, ?, ?)`;
  const valuesSoutenance = [date, time, location, status];

  db.query(querySoutenance, valuesSoutenance, (err, result) => {
    if (err) {
      console.error("❌ Error inserting soutenance:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const soutenanceId = result.insertId;

    // Insert jury members
    const juryInsertQuery = `
      INSERT INTO soutenance_jury (idSoutenance, idJury) VALUES ?`;
    const juryValues = juryIds.map((idJury) => [soutenanceId, idJury]);

    db.query(juryInsertQuery, [juryValues], (err) => {
      if (err) {
        console.error("❌ Error inserting jury members:", err);
        return res.status(500).json({ error: "Failed to assign jury members" });
      }

      // Insert multiple groups
      const groupInsertQuery = `
        INSERT INTO soutenance_groupe (idSoutenance, idGroupe) VALUES ?`;
      const groupValues = groupIds.map((idGroupe) => [soutenanceId, idGroupe]);

      db.query(groupInsertQuery, [groupValues], (err) => {
        if (err) {
          console.error("❌ Error inserting groups:", err);
          return res.status(500).json({ error: "Failed to assign groups" });
        }

        const queryWithDetails = `
          SELECT s.idSoutenance, s.date, s.time, s.location, s.status,
                 GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
                 GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
                 GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
          FROM soutenance s
          LEFT JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
          LEFT JOIN groupe g ON sg.idGroupe = g.idGroupe
          JOIN soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
          JOIN jury j ON sj.idJury = j.idJury
          WHERE s.idSoutenance = ?
          GROUP BY s.idSoutenance;
        `;

        db.query(queryWithDetails, [soutenanceId], (err, results) => {
          if (err) {
            console.error("❌ Error fetching detailed soutenance data:", err);
            return res.status(500).json({ error: "Failed to fetch detailed soutenance data" });
          }

          const soutenanceData = results[0];
          res.status(201).json({
            idSoutenance: soutenanceData.idSoutenance,
            date: soutenanceData.date,
            time: soutenanceData.time,
            location: soutenanceData.location,
            status: soutenanceData.status,
            groupNames: soutenanceData.groupNames,
            groupIds: soutenanceData.groupIds,
            juryNames: soutenanceData.juryNames,
          });
        });
      });
    });
  });
});

// Bulk update soutenance statuses
router.put("/bulk-update", (req, res) => {
  const { ids, status } = req.body;
  console.log("Received payload:", req.body);

  if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
    console.log("Validation failed");
    return res.status(400).json({ error: "IDs and status are required" });
  }

  const placeholders = ids.map(() => "?").join(", ");
  const query = `
    UPDATE soutenance
    SET status = ?
    WHERE idSoutenance IN (${placeholders});
  `;

  console.log("Executing query with:", status, ids);
  db.query(query, [status, ...ids], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Failed to update soutenances" });
    }
    console.log("Query result:", result);
    res.json({ message: `Successfully updated ${result.affectedRows} soutenances` });
  });
});

// Get a specific soutenance by ID with groupIds
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT s.idSoutenance, s.date, s.time, s.location, s.status, 
           GROUP_CONCAT(DISTINCT g.nomGroupe ORDER BY g.nomGroupe ASC SEPARATOR ' | ') AS groupNames,
           GROUP_CONCAT(DISTINCT g.idGroupe ORDER BY g.nomGroupe ASC SEPARATOR ',') AS groupIds,
           GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames
    FROM soutenance s
    LEFT JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
    LEFT JOIN groupe g ON sg.idGroupe = g.idGroupe
    JOIN soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
    JOIN jury j ON sj.idJury = j.idJury
    WHERE s.idSoutenance = ?
    GROUP BY s.idSoutenance;
  `;

  db.query(query, [id], (error, rows) => {
    if (error) {
      console.error("Error fetching soutenance:", error.message);
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
    UPDATE soutenance
    SET date = ?, time = ?, location = ?, status = ?
    WHERE idSoutenance = ?;
  `;
  const valuesSoutenance = [date, time, location, status, id];

  db.query(querySoutenance, valuesSoutenance, (err) => {
    if (err) {
      console.error("❌ Error updating soutenance:", err);
      return res.status(500).json({ error: "Failed to update soutenance" });
    }

    const juryDeleteQuery = `DELETE FROM soutenance_jury WHERE idSoutenance = ?`;
    db.query(juryDeleteQuery, [id], (err) => {
      if (err) {
        console.error("❌ Error deleting previous jury members:", err);
        return res.status(500).json({ error: "Failed to delete previous jury members" });
      }

      const juryInsertQuery = `
        INSERT INTO soutenance_jury (idSoutenance, idJury) VALUES ?;
      `;
      const juryValues = juryIds.map((idJury) => [id, idJury]);

      db.query(juryInsertQuery, [juryValues], (err) => {
        if (err) {
          console.error("❌ Error inserting new jury members:", err);
          return res.status(500).json({ error: "Failed to assign jury members" });
        }

        const groupDeleteQuery = `DELETE FROM soutenance_groupe WHERE idSoutenance = ?`;
        db.query(groupDeleteQuery, [id], (err) => {
          if (err) {
            console.error("❌ Error deleting previous groups:", err);
            return res.status(500).json({ error: "Failed to delete previous groups" });
          }

          const groupInsertQuery = `
            INSERT INTO soutenance_groupe (idSoutenance, idGroupe) VALUES ?;
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
              FROM soutenance s
              LEFT JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
              LEFT JOIN groupe g ON sg.idGroupe = g.idGroupe
              JOIN soutenance_jury sj ON sj.idSoutenance = s.idSoutenance
              JOIN jury j ON sj.idJury = j.idJury
              WHERE s.idSoutenance = ?
              GROUP BY s.idSoutenance;
            `;
            db.query(queryWithDetails, [id], (err, results) => {
              if (err) {
                console.error("❌ Error fetching updated soutenance data:", err);
                return res.status(500).json({ error: "Failed to fetch updated soutenance data" });
              }
              const updatedSoutenance = results[0];
              res.json(updatedSoutenance);
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

  const juryDeleteQuery = `DELETE FROM soutenance_jury WHERE idSoutenance = ?`;
  db.query(juryDeleteQuery, [id], (err) => {
    if (err) {
      console.error("❌ Error deleting jury members:", err);
      return res.status(500).json({ error: "Failed to delete jury members" });
    }

    const groupDeleteQuery = `DELETE FROM soutenance_groupe WHERE idSoutenance = ?`;
    db.query(groupDeleteQuery, [id], (err) => {
      if (err) {
        console.error("❌ Error deleting groups:", err);
        return res.status(500).json({ error: "Failed to delete groups" });
      }

      const soutenanceDeleteQuery = `DELETE FROM soutenance WHERE idSoutenance = ?`;
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
    SELECT DISTINCT g.idGroupe, g.nomGroupe
    FROM jury j
    LEFT JOIN encadrant e ON j.idEncadrant = e.idEncadrant
    LEFT JOIN sujet s ON e.idEncadrant = s.idEncadrant
    LEFT JOIN etudiantsujet es ON s.idSujet = es.idSujet
    LEFT JOIN etudiantgroupe eg ON es.idEtudiant = eg.idEtudiant
    JOIN groupe g ON eg.idGroupe = g.idGroupe
    WHERE j.idJury = ? AND j.idEncadrant IS NOT NULL;
  `;

  db.query(query, [idJury], (err, results) => {
    if (err) {
      console.error("❌ Error fetching jury groups:", err);
      return res.status(500).json({ error: "Failed to fetch jury groups" });
    }
    res.json(results);
  });
});

export default router;
