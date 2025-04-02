export class Document {
  constructor(id, idPFE, idEtudiant, idGroupe, fichier, type, authorName, subjectTitle, idLivrable) {
    this.id = id;
    this.idPFE = idPFE;
    this.idEtudiant = idEtudiant;
    this.idGroupe = idGroupe;
    this.fichier = fichier;
    this.type = type;
    this.authorName = authorName;
    this.subjectTitle = subjectTitle;
    this.idLivrable = idLivrable;
  }
}