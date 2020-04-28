class User {
  constructor() {
    this.id = 0;
    this.token = "";
    this.humanid = "";
    this.name = "";
    this.creationtime = 0;
    this.lastacttime = 0;
    this.timeout = 0;
    this.correlations = null;
  }

}

class Lobby {
  constructor() {
    this.id = 0;
    this.token = "";
    this.humanid = "";
    this.game = "";
    this.flags = "";
    this.name = "";
    this.description = "";
    this.password = "";
    this.privacy = "";
    this.creationtime = 0;
    this.lastacttime = 0;
    this.timeout = 0;
    this.correlations = null;
  }

}

class Correlation {
  constructor() {
    this.id = 0;
    this.usertoken = "";
    this.lobbytoken = "";
    this.invite = 0;
  }
}

module.exports = {
  User: User,
  Lobby: Lobby,
  Correlation: Correlation,
}