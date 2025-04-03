// src/entities/models/Document.js
export class Document {
  constructor(
    id,
    idPFE,
    fichier,
    type,
    nomGroupe,
    nbEtudiants,
    authorName,
    subjectTitle,
    validationStatus,
    comment,
    idLivrable
  ) {
    this.id = id;
    this.idPFE = idPFE;
    this.fichier = fichier;
    this.type = type;
    this.nomGroupe = nomGroupe;
    this.nbEtudiants = nbEtudiants;
    this.authorName = authorName;
    this.subjectTitle = subjectTitle;
    this.validationStatus = validationStatus;
    this.comment = comment;
    this.idLivrable = idLivrable;
  }
}