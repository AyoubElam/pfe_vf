export class Group {
  constructor(idGroupe, nomGroupe, nbEtudiants = 0, students = []) {
    this.idGroupe = idGroupe;
    this.nomGroupe = nomGroupe;
    this.nbEtudiants = nbEtudiants;
    this.students = students;
  }
}