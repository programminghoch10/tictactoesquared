class User {
  constructor() {
    this.id = 0;
    this.token = "";
    this.humanid = "";
    this.name = "";
    this.creationtime = 0;
    this.lastacttime = 0;
    this.timeout = 0;
    this.lobbytokens = "";
    this.lobbyinvitetokens = "";
  }

}

class Lobby {
  constructor() {
    this.id = 0;
    this.token = "";
    this.humanid = "";
    this.game = "";
    this.name = "";
    this.description = "";
    this.password = "";
    this.privacy = "";
    this.creationtime = 0;
    this.lastacttime = 0;
    this.timeout = 0;
    this.usertokens = "";
    this.userinvitetokens = "";
  }

}

module.exports = {
    User: User,
    Lobby: Lobby
}