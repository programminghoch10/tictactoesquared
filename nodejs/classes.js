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
  hasFlag(flag) {
    return JSON.parse(flags).includes(flag)
  }
  setFlag(flag) {
    let obj = JSON.parse(flags)
    if (this.hasFlag(flag)) return
    obj.push(flag)
    this.flags = JSON.stringify(obj)
  }
  removeFlag(flag) {
    let obj = JSON.parse(flags)
    if (!this.hasFlag(flag)) return
    obj.pop(flag)
    this.flags = JSON.stringify(obj)
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
