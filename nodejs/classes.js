
const common = require('./common.js')

class User {
  constructor() {
    this.id = 0;
    this.token = "";
    this.secret = "";
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
    this.game = "";
    this.flags = "";
    this.name = "";
    this.description = "";
    this.password = null;
    this.privacy = "";
    this.creationtime = 0;
    this.lastacttime = 0;
    this.timeout = 0;
    this.correlations = null;
  }
  hasFlag(flag) {
    return common.parseJSON(this.flags).includes(flag)
  }
  setFlag(flag) {
    let obj = common.parseJSON(this.flags)
    if (this.hasFlag(flag)) return
    obj.push(flag)
    this.flags = JSON.stringify(obj)
  }
  removeFlag(flag) {
    let obj = common.parseJSON(this.flags)
    if (!this.hasFlag(flag)) return
    obj.splice(obj.indexOf(flag), 1)
    this.flags = JSON.stringify(obj)
  }
}

class Correlation {
  constructor() {
    this.id = 0;
    this.usertoken = "";
    this.lobbytoken = "";
    this.invite = false;
  }
}

module.exports = {
  User: User,
  Lobby: Lobby,
  Correlation: Correlation,
}
