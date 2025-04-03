// src/entities/models/Evaluation.js
class Evaluation {
  /**
   * @param {number} idSoutenance
   * @param {string} idEtudiant
   * @param {number} idGroupe
   * @param {string} idEncadrant
   * @param {number|null} [noteRapport]
   * @param {number|null} [notePresentation]
   * @param {number|null} [noteDiscussion]
   * @param {number|null} [noteSavoirFaireSavoirEtre]
   * @param {number|null} [noteTotale]
   * @param {string} [remarque]
   * @param {string} [etudiant] - Full name of the student (nom and prenom)
   * @param {string} [nomGroupe] - Group name
   */
  constructor(
    idSoutenance,
    idEtudiant,
    idGroupe,
    idEncadrant,
    noteRapport = null,
    notePresentation = null,
    noteDiscussion = null,
    noteSavoirFaireSavoirEtre = null,
    noteTotale = null,
    remarque = '',
    etudiant = '',
    nomGroupe = ''
  ) {
    this.idSoutenance = idSoutenance;
    this.idEtudiant = idEtudiant;
    this.idGroupe = idGroupe;
    this.idEncadrant = idEncadrant;
    this.noteRapport = noteRapport;
    this.notePresentation = notePresentation;
    this.noteDiscussion = noteDiscussion;
    this.noteSavoirFaireSavoirEtre = noteSavoirFaireSavoirEtre;
    this.noteTotale = noteTotale;
    this.remarque = remarque;
    this.etudiant = etudiant;
    this.nomGroupe = nomGroupe;
  }

  calculateTotal() {
    const grades = [
      this.noteRapport,
      this.notePresentation,
      this.noteDiscussion,
      this.noteSavoirFaireSavoirEtre,
    ].filter(grade => grade !== null && !isNaN(grade));
    
    return grades.length > 0 
      ? Number((grades.reduce((acc, grade) => acc + grade, 0) / grades.length).toFixed(2))
      : null;
  }
}

export { Evaluation };
