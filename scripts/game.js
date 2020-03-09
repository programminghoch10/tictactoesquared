//app.js
//  contains all game scripts

const player1 = "X";
const player2 = "O";
const size = 7;
document.title = Array(size).fill(null).map(() => "T").join("") + "²";

function getglobalid(x, y) {
  return x + "" + y;
}

function getid(x, y, a, b) {
  return x + "" + y + "" + a + "" + b;
}

class Game {
  constructor(frontendinterface) {
    this.frontendinterface = frontendinterface;

    this.fields = Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => 0))));
    this.globalField = Array(size).fill(null).map(() => new Array(size).fill(null).map(() =>0));

    this.currentField = {
      all: true,
      x: 0,
      y: 0
    };
    this.currentPlayer = 0;
    this.setCurrentPlayer(player1);

    this.end = false; // will be true if the game is over

    this.debug = false;
  }

  isValid(x, y, a, b) {
    if (this.debug) return true;

    if (!this.currentField.all && !(this.currentField.x == x && this.currentField.y == y)) return false;
    if (this.fields[x][y][a][b] != "") return false;
    return true;
  }

  isFull(x, y) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
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
    if (this.end) return;
    if (!this.isValid(x, y, a, b)) return;

    this.setTile(x, y, a, b, this.currentPlayer);
    this.checkWin(x, y, a, b, this.currentPlayer);

    this.setCurrentField(a, b);

    this.switchPlayers();
  }

  win(x, y, a, b, player) {
    this.globalField[x][y] = player;

    this.frontendinterface.win(x, y, a, b, player);
  }

  globalWin(x, y, player) {
    this.end = true;

    this.frontendinterface.globalWin(player);
  }

  draw() {
    this.end = true;

    this.frontendinterface.draw();
  }

  isGlobalFieldFull() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {

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

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let a = 0; a < size; a++) {
          for (let b = 0; b < size; b++) {
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
    for (let i = 0; i < size; i++) {
      wins[0] += this.globalField[i][y] == player ? 1 : 0;
      wins[1] += this.globalField[x][i] == player ? 1 : 0;
      wins[2] += this.globalField[i][i] == player ? 1 : 0;
      wins[3] += this.globalField[i][size - i - 1] == player ? 1 : 0;
    }

    if (wins[0] == size || wins[1] == size || wins[2] == size || wins[3] == size) {
      this.globalWin(x, y, player);
    }
  }

  checkWin(x, y, a, b, player) {
    if (this.globalField[x][y] != 0) return;

    let wins = [0, 0, 0, 0];
    for (let i = 0; i < size; i++) {
      wins[0] += this.fields[x][y][i][b] == player ? 1 : 0;
      wins[1] += this.fields[x][y][a][i] == player ? 1 : 0;
      wins[2] += this.fields[x][y][i][i] == player ? 1 : 0;
      wins[3] += this.fields[x][y][i][size - i - 1] == player ? 1 : 0;
    }

    if (wins[0] == size || wins[1] == size || wins[2] == size || wins[3] == size) {
      this.win(x, y, a, b, player);
      this.checkGlobalWin(x, y, player);
    }

    if (this.checkDraw()) {
      this.draw();
    }
  }
}
