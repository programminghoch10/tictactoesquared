// https://davidwalsh.name/query-string-javascript
//var params = new URLSearchParams(location.search); //get search parameters, currently unused

const EMPTYFRONTENDINTERFACE = {
  setTile: (x, y, a, b, currentPlayer) => { },
  setCurrentPlayer: (player) => { },
  setCurrentFieldBefore: (x, y) => { },
  setCurrentFieldAfter: (x, y) => { },
  win: (x, y, a, b, player) => { },
  globalWin: (player) => { },
  draw: () => { },
  rematch: () => { },
}

const player1 = "X";
const player2 = "O";
function getglobalid(x, y) {
  return x + "" + y;
}

function getid(x, y, a, b) {
  return x + "" + y + "" + a + "" + b;
}

class Game {
  constructor(frontendinterface, size) {
    this.frontendinterface = frontendinterface == null ? EMPTYFRONTENDINTERFACE : frontendinterface;

    try {
      this.size = parseInt(size);
    } catch {
      this.size = 3;
    }
    if (this.size <= 1) this.size = 3;
    if (!isFinite(this.size)) this.size = 3;

    this.init();
  }

  init() {
    this.fields = Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => 0))));
    this.globalField = Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => 0));

    this.currentField = {
      all: true,
      x: 0,
      y: 0
    };
    this.currentPlayer = 0;
    this.setCurrentPlayer(player1);

    this.end = false; // will be true if the game is over
    this.won = 0;
    this.score = 0;
    this.progress = 0;

    this.debug = true; // TODO: remove
  }

  clone() {
    let copy = new Game(EMPTYFRONTENDINTERFACE, this.size);
    copy.currentPlayer = this.currentPlayer;
    copy.fields = JSON.parse(JSON.stringify(this.fields));
    copy.globalField = JSON.parse(JSON.stringify(this.globalField));
    copy.currentField = JSON.parse(JSON.stringify(this.currentField));
    copy.end = this.end;
    copy.won = this.won;
    copy.score = this.score;

    return copy;
  }

  isValid(x, y, a, b) {
    if (this.debug) return true;

    if (!this.currentField.all && !(this.currentField.x == x && this.currentField.y == y)) return false;
    if (this.fields[x][y][a][b] != "") return false;
    return true;
  }

  isFull(x, y) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let id = getid(x, y, i, j);
        if (this.fields[x][y][i][j] == 0) {
          return false;
        }
      }
    }

    return true;
  }

  setCurrentPlayer(currentPlayer) {
    this.currentPlayer = currentPlayer;

    this.frontendinterface.setCurrentPlayer(currentPlayer);
  }

  switchPlayers() {
    if (this.won) return

    if (this.currentPlayer == player1) {
      this.setCurrentPlayer(player2);
    } else {
      this.setCurrentPlayer(player1);
    }
  }

  setTile(x, y, a, b, currentPlayer) {
    this.fields[x][y][a][b] = currentPlayer;
    this.progress++;

    this.frontendinterface.setTile(x, y, a, b, currentPlayer);
  }

  setCurrentField(x, y) {
    if (!this.currentField.all) {
      this.frontendinterface.setCurrentFieldBefore(this.currentField.x, this.currentField.y);
    }

    if (this.isFull(x, y)) {
      this.currentField.all = true;
      return;
    }

    this.currentField.all = false;
    this.currentField.x = x;
    this.currentField.y = y;

    this.frontendinterface.setCurrentFieldAfter(this.currentField.x, this.currentField.y);
  }

  set(x, y, a, b) {
    if (this.end) return false;
    if (!this.isValid(x, y, a, b)) return false;

    this.setTile(x, y, a, b, this.currentPlayer);
    this.checkWin(x, y, a, b, this.currentPlayer);

    this.setCurrentField(a, b);

    this.switchPlayers();

    return true;
  }

  _set(x, y, a, b, player) {
    if (player == this.currentPlayer) {
      return this.set(x, y, a, b)
    }

    return false
  }

  win(x, y, a, b, player) {
    this.globalField[x][y] = player;

    this.frontendinterface.win(x, y, a, b, player);
  }

  globalWin(x, y, player) {
    this.end = true;
    this.won = player;

    this.frontendinterface.globalWin(player);
  }

  draw() {
    this.end = true;
    this.won = "draw"

    this.frontendinterface.draw();
  }

  isGlobalFieldFull() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {

        if (this.globalField[x][y] == 0) {
          return false;
        }
      }
    }

    return true;
  }

  checkDraw() {
    if (this.end) return;

    if (this.isGlobalFieldFull()) {
      return true;
    }

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let a = 0; a < this.size; a++) {
          for (let b = 0; b < this.size; b++) {
            if (this.fields[x][y][a][b] == 0) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  checkGlobalWin(x, y, player) {
    let wins = [0, 0, 0, 0];
    for (let i = 0; i < this.size; i++) {
      wins[0] += this.globalField[i][y] == player ? 1 : 0;
      wins[1] += this.globalField[x][i] == player ? 1 : 0;
      wins[2] += this.globalField[i][i] == player ? 1 : 0;
      wins[3] += this.globalField[i][this.size - i - 1] == player ? 1 : 0;
    }

    if (wins[0] == this.size || wins[1] == this.size || wins[2] == this.size || wins[3] == this.size) {
      this.globalWin(x, y, player);
    }
  }

  checkWin(x, y, a, b, player) {
    if (this.globalField[x][y] != 0) return;

    let wins = [0, 0, 0, 0];
    for (let i = 0; i < this.size; i++) {
      wins[0] += this.fields[x][y][i][b] == player ? 1 : 0;
      wins[1] += this.fields[x][y][a][i] == player ? 1 : 0;
      wins[2] += this.fields[x][y][i][i] == player ? 1 : 0;
      wins[3] += this.fields[x][y][i][this.size - i - 1] == player ? 1 : 0;
    }

    if (wins[0] == this.size || wins[1] == this.size || wins[2] == this.size || wins[3] == this.size) {
      this.win(x, y, a, b, player);
      this.checkGlobalWin(x, y, player);
    }

    if (this.checkDraw()) {
      this.draw();
    }
  }

  toString() {
    let saveGame = "";

    saveGame += this.size + "-";

    if (this.end) {
      saveGame += "!" + this.won.substring(0, 1)
    }

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let a = 0; a < this.size; a++) {
          for (let b = 0; b < this.size; b++) {
            let field = this.fields[x][y][a][b];
            saveGame += "" + (field == "" ? "-" : field);
          }
        }
      }
    }
    saveGame += this.currentPlayer;
    saveGame += this.currentField.all == true ? 1 : 0;
    saveGame += this.currentField.x + "" + this.currentField.y;

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        saveGame += this.globalField[i][j];
      }
    }

    return saveGame;
  }

  fromString(saveGame) {
    if (saveGame == "" || saveGame == undefined) return false;

    this.size = parseInt(saveGame.substring(0, saveGame.indexOf("-")));

    saveGame = saveGame.substring(saveGame.indexOf("-") + 1);

    let won = ""
    let end = false
    if (saveGame.substring(0, 1) == "!") {
      end = true
      won = saveGame.substring(1, 2)
      if (won == "d") won = "draw"

      this.frontendinterface.globalWin(won)

      saveGame = saveGame.substring(2)
    } else if (this.end) {
      this.rematch()
    }

    this.init();
    this.end = end
    this.won = won

    //saveGame = saveGame.replace(/([^-XO012])+/g, ""); //TODO: fix regex for fieldsize > 3
    saveGame = saveGame.split("-").join(" ");

    let expectedSaveGameLength = (this.size * this.size * this.size * this.size + this.size * this.size + 4);
    if (saveGame.length != expectedSaveGameLength) {
      return false;
    }

    let position = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let a = 0; a < this.size; a++) {
          for (let b = 0; b < this.size; b++) {
            let char = saveGame.substring(position, position + 1);
            if (char != " " && char != "") {
              this.setTile(x, y, a, b, char);
            }
            position++;
          }
        }
      }
    }

    this.currentPlayer = saveGame.substring(position, position + 1);
    this.setCurrentPlayer(this.currentPlayer);
    position++;
    this.currentField.all = saveGame.substring(position, position + 1) == 1;
    position++;
    this.currentField.x = saveGame.substring(position, position + 1);
    position++;
    this.currentField.y = saveGame.substring(position, position + 1);

    this.frontendinterface.setCurrentFieldAfter(this.currentField.x, this.currentField.y, this.currentField.all);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        position++;
        this.globalField[i][j] = saveGame.substring(position, position + 1);
        if (this.globalField[i][j] == player1) {
          this.frontendinterface.win(i, j, 0, 0, player1);
        } else if (this.globalField[i][j] == player2) {
          this.frontendinterface.win(i, j, 0, 0, player2);
        }
      }
    }

    return true;
  }

  giveUp() {
    this.end = true;
    this.won = "f";

    this.frontendinterface.globalWin(this.currentPlayer);
  }

  rematch() {
    this.frontendinterface.rematch()
  }
}

try {
  module.exports = Game;
} catch {

}
