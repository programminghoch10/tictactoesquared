//app.js
//  contains all game scripts

const EMPTYFRONTENDINTERFACE = {
  setTile: (x, y, a, b, currentPlayer) => { },
  setCurrentPlayer: (player) => { },
  setCurrentFieldBefore: (x, y) => { },
  setCurrentFieldAfter: (x, y) => { },
  win: (x, y, a, b, player) => { },
  globalWin: (player) => { },
  draw: () => { }
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
  constructor(frontendinterface) {
    this.frontendinterface = frontendinterface;

    this.fields = Array(3).fill(null).map(() => new Array(3).fill(null).map(() => new Array(3).fill(null).map(() => new Array(3).fill(null).map(() => 0))));
    this.globalField = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

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

    this.debug = false;
  }

  clone() {
    let copy = new Game(EMPTYFRONTENDINTERFACE);
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
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
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
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {

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

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let a = 0; a < 3; a++) {
          for (let b = 0; b < 3; b++) {
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
    for (let i = 0; i < 3; i++) {
      wins[0] += this.globalField[i][y] == player ? 1 : 0;
      wins[1] += this.globalField[x][i] == player ? 1 : 0;
      wins[2] += this.globalField[i][i] == player ? 1 : 0;
      wins[3] += this.globalField[i][2 - (i % 3)] == player ? 1 : 0;
    }

    if (wins[0] == 3 || wins[1] == 3 || wins[2] == 3 || wins[3] == 3) {
      this.globalWin(x, y, player);
    }
  }

  checkWin(x, y, a, b, player) {
    if (this.globalField[x][y] != 0) return;

    let wins = [0, 0, 0, 0];
    for (let i = 0; i < 3; i++) {
      wins[0] += this.fields[x][y][i][b] == player ? 1 : 0;
      wins[1] += this.fields[x][y][a][i] == player ? 1 : 0;
      wins[2] += this.fields[x][y][i][i] == player ? 1 : 0;
      wins[3] += this.fields[x][y][i][2 - (i % 3)] == player ? 1 : 0;
    }

    if (wins[0] == 3 || wins[1] == 3 || wins[2] == 3 || wins[3] == 3) {
      this.win(x, y, a, b, player);
      this.checkGlobalWin(x, y, player);
    }

    if (this.checkDraw()) {
      this.draw();
    }
  }
}
