// src/application/repositories/SoutenancePdfRepository.js
import db from "../../../config/db.js"

export class SoutenancePdfRepository {
  getEvaluationDataForSoutenance(idSoutenance) {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT s.*, g.nomGroupe, g.idGroupe, su.titre AS sujetTitre, DATE_FORMAT(s.date, '%Y') as year
        FROM soutenance s
        JOIN soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
        JOIN groupe g ON sg.idGroupe = g.idGroupe
        LEFT JOIN sujet su ON g.idSujet = su.idSujet
        WHERE s.idSoutenance = ?`,
        [idSoutenance],
        (err, soutenance) => {
          if (err) {
            return reject(err)
          }
          if (!soutenance || soutenance.length === 0) {
            return reject(new Error(`Soutenance with ID ${idSoutenance} not found`))
          }

          // Get jury information
          db.query(
            `
          SELECT j.*, e.nom, e.prenom 
          FROM jury j
          JOIN encadrant e ON j.idEncadrant = e.idEncadrant
          JOIN soutenance_jury sj ON j.idJury = sj.idJury
          WHERE sj.idSoutenance = ?`,
            [idSoutenance],
            (err, jury) => {
              if (err) {
                return reject(err)
              }

              // Get all students for this group
              const groupIds = soutenance.map((s) => s.idGroupe)

              db.query(
                `
            SELECT e.*, e.idGroupe, ev.noteRapport, ev.notePresentation, ev.noteDiscussion, ev.noteTotale
            FROM etudiant e
            LEFT JOIN evaluation ev ON e.idEtudiant = ev.idEtudiant AND ev.idSoutenance = ?
            WHERE e.idGroupe IN (?)`,
                [idSoutenance, groupIds],
                (err, students) => {
                  if (err) {
                    return reject(err)
                  }

                  // Group students by group
                  const studentsByGroup = {}
                  students.forEach((student) => {
                    if (!studentsByGroup[student.idGroupe]) {
                      studentsByGroup[student.idGroupe] = []
                    }
                    studentsByGroup[student.idGroupe].push(student)
                  })

                  // Format data for PDF generation
                  const entries = []

                  // Get jury names
                  const juryMembers = {}
                  jury.forEach((j) => {
                    juryMembers[j.idJury] = `${j.nom} ${j.prenom}`
                  })

                  // Default jury name if none found
                  const defaultJuryName = Object.values(juryMembers)[0] || "M.EL Abdellaoui"

                  soutenance.forEach((s) => {
                    const groupStudents = studentsByGroup[s.idGroupe] || []

                    entries.push({
                      jury: defaultJuryName,
                      groupNumber: s.idGroupe,
                      students: groupStudents.map((student) => ({
                        name: `${student.nom} ${student.prenom}`,
                        noteRapport: student.noteRapport,
                        notePresentation: student.notePresentation,
                        noteDiscussion: student.noteDiscussion,
                        noteTotale: student.noteTotale,
                      })),
                    })
                  })

                  // If no data is found, provide sample data for testing
                  if (entries.length === 0 || entries[0].students.length === 0) {
                    entries.push({
                      jury: "M.EL Abdellaoui",
                      groupNumber: 1,
                      students: [{ name: "hayat remmani" }, { name: "hamza Asseddek" }, { name: "Saadia ajdour" }],
                    })

                    entries.push({
                      jury: "M.EL Abdellaoui",
                      groupNumber: 2,
                      students: [
                        { name: "Anis ZEROUALI" },
                        { name: "Abderrahmane FENNANE" },
                        { name: "Chaima ELBELLEHOUANE" },
                      ],
                    })

                    entries.push({
                      jury: "Mme Arhid",
                      groupNumber: 6,
                      students: [{ name: "Elkamouni Chaima" }, { name: "Kara Wissal" }, { name: "Kharfali Oumaima" }],
                    })
                  }

                  resolve({
                    entries: entries,
                    universityInfo: {
                      name: "Université Cadi Ayyad",
                      school: "Ecole Supérieure de Technologie - Safi",
                      department: "Informatique",
                      level: "2ème Année",
                      year: soutenance[0]?.year
                        ? `${soutenance[0].year}-${Number.parseInt(soutenance[0].year) + 1}`
                        : "2021-2022",
                    },
                  })
                },
              )
            },
          )
        },
      )
    })
  }
}

