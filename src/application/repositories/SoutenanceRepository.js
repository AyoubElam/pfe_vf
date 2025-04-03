// src/repositories/SoutenanceRepository.js
import db from "../../../config/db.js";
import { Soutenance } from "../../entities/models/Soutenance.js";

export class SoutenanceRepository {
  async getAll(year) {
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

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(row => new Soutenance(
          row.idSoutenance,
          row.date,
          row.time,
          row.location,
          row.status,
          row.groupIds.split(","),
          [],
          row.groupNames,
          row.juryNames
        )));
      });
    });
  }

  async getById(id) {
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
    return new Promise((resolve, reject) => {
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        const row = results[0];
        resolve(new Soutenance(
          row.idSoutenance,
          row.date,
          row.time,
          row.location,
          row.status,
          row.groupIds.split(","),
          [],
          row.groupNames,
          row.juryNames
        ));
      });
    });
  }

  async create(soutenanceData) {
    const { date, time, location, juryIds, groupIds, status } = soutenanceData;
    const querySoutenance = `
      INSERT INTO smart_v.soutenance (date, time, location, status)
      VALUES (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
      db.query(querySoutenance, [date, time, location, status], (err, result) => {
        if (err) return reject(err);
        const soutenanceId = result.insertId;

        const juryInsertQuery = `INSERT INTO smart_v.soutenance_jury (idSoutenance, idJury) VALUES ?`;
        const juryValues = juryIds.map(id => [soutenanceId, id]);
        db.query(juryInsertQuery, [juryValues], (err) => {
          if (err) return reject(err);

          const groupInsertQuery = `INSERT INTO smart_v.soutenance_groupe (idSoutenance, idGroupe) VALUES ?`;
          const groupValues = groupIds.map(id => [soutenanceId, id]);
          db.query(groupInsertQuery, [groupValues], (err) => {
            if (err) return reject(err);

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
              if (err) return reject(err);
              const row = results[0];
              resolve(new Soutenance(
                row.idSoutenance,
                row.date,
                row.time,
                row.location,
                row.status,
                row.groupIds.split(","),
                juryIds,
                row.groupNames,
                row.juryNames
              ));
            });
          });
        });
      });
    });
  }

  async update(id, { date, time, location, status, groupIds, juryIds }) {
    const querySoutenance = `
      UPDATE smart_v.soutenance
      SET date = ?, time = ?, location = ?, status = ?
      WHERE idSoutenance = ?`;
    return new Promise((resolve, reject) => {
      db.query(querySoutenance, [date, time, location, status, id], (err) => {
        if (err) return reject(err);

        const juryDeleteQuery = `DELETE FROM smart_v.soutenance_jury WHERE idSoutenance = ?`;
        db.query(juryDeleteQuery, [id], (err) => {
          if (err) return reject(err);

          const juryInsertQuery = `INSERT INTO smart_v.soutenance_jury (idSoutenance, idJury) VALUES ?`;
          const juryValues = juryIds.map(idJury => [id, idJury]);
          db.query(juryInsertQuery, [juryValues], (err) => {
            if (err) return reject(err);

            const groupDeleteQuery = `DELETE FROM smart_v.soutenance_groupe WHERE idSoutenance = ?`;
            db.query(groupDeleteQuery, [id], (err) => {
              if (err) return reject(err);

              const groupInsertQuery = `INSERT INTO smart_v.soutenance_groupe (idSoutenance, idGroupe) VALUES ?`;
              const groupValues = groupIds.map(idGroupe => [id, idGroupe]);
              db.query(groupInsertQuery, [groupValues], (err) => {
                if (err) return reject(err);

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
                  if (err) return reject(err);
                  const row = results[0];
                  resolve(new Soutenance(
                    row.idSoutenance,
                    row.date,
                    row.time,
                    row.location,
                    row.status,
                    row.groupIds.split(","),
                    juryIds,
                    row.groupNames,
                    row.juryNames
                  ));
                });
              });
            });
          });
        });
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const juryDeleteQuery = `DELETE FROM smart_v.soutenance_jury WHERE idSoutenance = ?`;
      db.query(juryDeleteQuery, [id], (err) => {
        if (err) return reject(err);

        const groupDeleteQuery = `DELETE FROM smart_v.soutenance_groupe WHERE idSoutenance = ?`;
        db.query(groupDeleteQuery, [id], (err) => {
          if (err) return reject(err);

          const soutenanceDeleteQuery = `DELETE FROM smart_v.soutenance WHERE idSoutenance = ?`;
          db.query(soutenanceDeleteQuery, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
          });
        });
      });
    });
  }

  async bulkUpdate(ids, status) {
    const placeholders = ids.map(() => "?").join(", ");
    const query = `
      UPDATE smart_v.soutenance
      SET status = ?
      WHERE idSoutenance IN (${placeholders});
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [status, ...ids], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows);
      });
    });
  }

  async getJuryGroups(idJury) {
    const query = `
      SELECT DISTINCT g.idGroupe, g.nomGroupe, g.annee, t.nom AS tuteurNom, s.titre AS sujetTitre, e.nom AS encadrantNom
      FROM smart_v.jury j
      JOIN smart_v.encadrant e ON j.idEncadrant = e.idEncadrant
      LEFT JOIN (
          SELECT g.idGroupe, g.nomGroupe, g.annee, g.idTuteur, g.idSujet
          FROM smart_v.groupe g
          JOIN smart_v.sujet s ON g.idSujet = s.idSujet
          WHERE s.idEncadrant = (
              SELECT idEncadrant FROM smart_v.jury WHERE idJury = ?
          )
          UNION
          SELECT g.idGroupe, g.nomGroupe, g.annee, g.idTuteur, g.idSujet
          FROM smart_v.groupe g
          JOIN smart_v.soutenance sout ON g.idGroupe = sout.idGroupe
          JOIN smart_v.encadrantsoutenance es ON sout.idSoutenance = es.idSoutenance
          WHERE es.idEncadrant = (
              SELECT idEncadrant FROM smart_v.jury WHERE idJury = ?
          )
          UNION
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
    return new Promise((resolve, reject) => {
      db.query(query, [idJury, idJury, idJury, idJury], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async getTutorSoutenances(idTuteur) {
    const query = `
      SELECT 
        s.idSoutenance, DATE(s.date) AS date, s.time, s.location, s.status,
        g.idGroupe, g.nomGroupe, j.nom AS juryNom
      FROM soutenance s
      INNER JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      INNER JOIN groupe g ON sg.idGroupe = g.idGroupe
      INNER JOIN pfe p ON g.idGroupe = p.idGroupe
      LEFT JOIN soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      LEFT JOIN jury j ON sj.idJury = j.idJury
      WHERE p.idTuteur = ?;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idTuteur], (err, results) => {
        if (err) return reject(err);
        const soutenancesMap = new Map();
        results.forEach(row => {
          if (!soutenancesMap.has(row.idSoutenance)) {
            soutenancesMap.set(row.idSoutenance, new Soutenance(
              row.idSoutenance, row.date, row.time, row.location, row.status,
              [row.idGroupe], [], row.nomGroupe, ""
            ));
          }
          if (row.juryNom) {
            const soutenance = soutenancesMap.get(row.idSoutenance);
            soutenance.juryNames = soutenance.juryNames ? `${soutenance.juryNames} | ${row.juryNom}` : row.juryNom;
          }
        });
        resolve(Array.from(soutenancesMap.values()));
      });
    });
  }

  async getSoutenancesByGroup(groupId) {
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
      FROM smart_v.soutenance s
      INNER JOIN smart_v.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      INNER JOIN smart_v.groupe g ON sg.idGroupe = g.idGroupe
      LEFT JOIN smart_v.soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      LEFT JOIN smart_v.jury j ON sj.idJury = j.idJury
      WHERE sg.idGroupe = ?
      GROUP BY s.idSoutenance, sg.idGroupe, g.nomGroupe;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [groupId], (err, results) => {
        if (err) return reject(err);
        const soutenances = results.map(row => ({
          idSoutenance: row.idSoutenance,
          date: row.date,
          time: row.time,
          location: row.location,
          status: row.status,
          idGroupe: row.idGroupe,
          nomGroupe: row.nomGroupe,
          juryNames: row.juryNames || ""
        }));
        resolve(soutenances);
      });
    });
  }
  async getByEncadrant(idEncadrant, year = null) {
    let query = `
      SELECT 
        s.idSoutenance,
        s.date,
        s.time,
        s.location,
        s.status,
        g.idGroupe,
        g.nomGroupe,
        su.titre AS subjectTitle,
        GROUP_CONCAT(DISTINCT j.nom ORDER BY j.nom ASC SEPARATOR ' | ') AS juryNames,
        COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
        GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames
      FROM soutenance s
      JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      JOIN groupe g ON sg.idGroupe = g.idGroupe
      JOIN sujet su ON g.idSujet = su.idSujet
      LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
      LEFT JOIN soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      LEFT JOIN jury j ON sj.idJury = j.idJury
      WHERE su.idEncadrant = ?
    `;
  
    const params = [idEncadrant];
  
    if (year && year !== "all") {
      query += " AND YEAR(s.date) = ?";
      params.push(year);
    }
  
    query += " GROUP BY s.idSoutenance, g.idGroupe, g.nomGroupe, su.titre";
  
    console.log("Executing query:", query);
    console.log("Parameters:", params);
  
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          console.error("Error fetching soutenances:", err);
          return reject(err);
        }
  
        console.log("Query results:", results);
        
        resolve(results.map(row => ({
          idSoutenance: row.idSoutenance,
          date: row.date,
          time: row.time,
          location: row.location,
          status: row.status,
          idGroupe: row.idGroupe,
          nomGroupe: row.nomGroupe,
          subjectTitle: row.subjectTitle,
          juryNames: row.juryNames || "Aucun jury assigné",
          nbEtudiants: row.nbEtudiants,
          studentNames: row.studentNames
        })));
      });
    });
  }
}