export class Soutenance {
  constructor(idSoutenance, date, time, location, status, groupIds = [], juryIds = [], groupNames = "", juryNames = "") {
    this.idSoutenance = idSoutenance;
    this.date = date;
    this.time = time;
    this.location = location;
    this.status = status;
    this.groupIds = groupIds;
    this.juryIds = juryIds;
    this.groupNames = groupNames;
    this.juryNames = juryNames;
  }
}