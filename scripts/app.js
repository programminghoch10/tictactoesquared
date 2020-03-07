//app.js
//  contains all game scripts

const player1 = "X";
const player2 = "O";

function getel(element) {
  return document.getElementById(element);
}

function getglobalel(x, y) {
  return x + "" + y;
}

function getid(x, y, a, b) {
  return x + "" + y + "" + a + "" + b;
}

function restart() {
  resetFieldCookie();
  reload();
}

function reload() {
  document.location.href = document.location.href;
}

class Game {
  constructor() {
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
    this.currentPlayer = player1;

    this.end = false; // will be true if the game is voer
  }

  isValid(x, y, a, b) {
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
  }

  switchPlayers() {
    if (this.currentPlayer == player1) {
      this.setCurrentPlayer(player2);
    } else {
      this.setCurrentPlayer(player1);
    }
  }

  setTile(x, y, a, b, currentPlayer) {
    let el = getel(getid(x, y, a, b));

    this.fields[x][y][a][b] = currentPlayer;
    el.classList.add(currentPlayer);
    el.classList.add("ox");
  }

  setCurrentField(x, y) {
    if (!this.currentField.all) {
      let el = getel(getglobalel(this.currentField.x, this.currentField.y));
      el.classList.remove("current");
    }

    if (this.isFull(x, y)) {
      this.currentField.all = true;
      return;
    }

    let el = getel(getglobalel(x, y));
    el.classList.add("current");

    this.currentField.all = false;
    this.currentField.x = x;
    this.currentField.y = y;
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
    let el = getel(getglobalel(x, y));

    el.classList.add("win");
    el.classList.add("win" + player);

    this.globalField[x][y] = player;
  }

  globalWin(a, b, player) {
    getel("win").classList.add("win-active");
    getel("win").classList.add(player);
  }

  checkGlobalWin(a, b, player) {
    let wins = [0, 0, 0, 0];
    for (let i = 0; i < 3; i++) {
      wins[0] += this.globalField[i][b] == player ? 1 : 0;
      wins[0] += this.globalField[a][i] == player ? 1 : 0;
      wins[0] += this.globalField[i][i] == player ? 1 : 0;
      wins[0] += this.globalField[i][2 - (i % 3)] == player ? 1 : 0;
    }

    if (wins[0] == 3 || wins[1] == 3 || wins[2] == 3 || wins[3] == 3) {
      this.globalWin(a, b, player);
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
      this.checkGlobalWin(a, b, player);
    }
  }
}

/*
let game = new Array(3)
  .fill(null)
  .map(() =>
    new Array(3)
      .fill(null)
      .map(() =>
        new Array(3).fill(null).map(() => new Array(3).fill(null).map(() => 0))
      )
  );

let currentPlayer = player1;

function getGameField(id) {
  return game[id.substring(0, 1)][id.substring(1, 2)][id.substring(2, 3)][
    id.substring(3, 4)
  ];
}

function isValid(x, y, a, b) {
  if (!currentField.all && !(currentField.x == x && currentField.y == y)) {
    return;
  }

  if (getGameField(getid(x, y, a, b)) != "") {
    return;
  }

  return true;
}

let currentField = {
  all: true,
  x: 0,
  y: 0
};

let outerfield = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

function switchPlayer() {
  if (currentPlayer == player1) {
    currentPlayer = player2;
  } else {
    currentPlayer = player1;
  }
}

function setActiveField(all, a, b) {
  let id = gettableid(currentField.x, currentField.y);

  getel(id).classList.remove("active");

  currentField.all = all;
  currentField.x = a;
  currentField.y = b;

  if (all) return;

  id = gettableid(currentField.x, currentField.y);

  let empty = false;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let id = getid(currentField.x, currentField.y, i, j);
      if (getGameField(id) == "") {
        empty = true;
      }
    }
  }

  if (!empty) {
    currentField.all = true;
    return;
  }

  getel(id).classList.add("active");
}

function checkWin(x, y, a, b, player) {
  let table = getel(gettableid(x, y));
  let counter1 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i, b);
    if (getGameField(id) == player) {
      counter1++;
    }
  }
  let counter2 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, a, i);
    if (getGameField(id) == player) {
      counter2++;
    }
  }
  let counter3 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i % 3, i % 3);
    if (getGameField(id) == player) {
      counter3++;
    }
  }
  let counter4 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i % 3, 2 - (i % 3));
    if (getGameField(id) == player) {
      counter4++;
    }
  }

  if (counter1 == 3 || counter2 == 3 || counter3 == 3 || counter4 == 3) {
    table.classList.add("win");
    table.classList.add("win" + player);

    outerfield[x][y] = player;
    let counter1 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[x][i] == player) {
        counter1++;
      }
    }
    let counter2 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i][y] == player) {
        counter2++;
      }
    }
    let counter3 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i % 3][i % 3] == player) {
        counter3++;
      }
    }
    let counter4 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i % 3][2 - (i % 3)] == player) {
        counter4++;
      }
    }

    if (counter1 == 3 || counter2 == 3 || counter3 == 3 || counter4 == 3) {
      getel("win").classList.add("win-active");
      getel("win").innerHTML = currentPlayer + " won.";
    }
  }
}

function checkDraw() {
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          let field = getGameField(getid(i, j, k, l));
          if (field != "") counter++;
        }
      }
    }
  }
  if (counter == 3 * 3 * 3 * 3) {
    getel("win").classList.add("win-active");
    getel("win").innerHTML = "Draw.";
  }
}

function mousedown(x, y, a, b) {
  if (getel("win").classList.contains("win-active")) return;

  if (!isValid(x, y, a, b)) return;

  let id = getid(x, y, a, b);

  game[x][y][a][b] = currentPlayer;
  getel(id).classList.add(currentPlayer);
  getel(id).classList.add("ox");
  if (!getel(gettableid(x, y)).classList.contains("win")) {
    checkWin(x, y, a, b, currentPlayer);
  }
  checkDraw();
  setActiveField(false, a, b);

  switchPlayer();

  asyncSaveField();
}

function restart() {
  resetFieldCookie();
  reload();
}

function reload() {
  document.location.href = document.location.href;
}

function saveField() {
  let cookie = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          let field = getGameField(getid(i, j, k, l));
          cookie += "" + (field == "" ? "-" : field);
        }
      }
    }
  }
  cookie += currentPlayer;
  cookie += currentField.all == true ? 1 : 0;
  cookie += currentField.x + "" + currentField.y;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      cookie += outerfield[i][j];
    }
  }

  setCookie("game", cookie, 365);
}

async function asyncSaveField() {
  saveField();
}

function loadField() {
  let cookie = getCookie("game");
  cookie = cookie.replace(/([^-XO012])+/g, "");
  cookie = cookie.split("-").join(" ");
  if (cookie.length != 3 * 3 * 3 * 3 + 12) resetFieldCookie();
  if (cookie == "") return;
  let position = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          let char = cookie.substring(position, position + 1);
          if (char != " " && char != "") {
            game[i][j][k][l] = char;
            getel(getid(i, j, k, l)).classList.add(char);
          }
          position++;
        }
      }
    }
  }

  currentPlayer = cookie.substring(position, position + 1);
  position++;
  currentField.all = cookie.substring(position, position + 1) == 1;
  position++;
  currentField.x = cookie.substring(position, position + 1);
  position++;
  currentField.y = cookie.substring(position, position + 1);

  if (!currentField.all) {
    getel(gettableid(currentField.x, currentField.y)).classList.add("active");
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      position++;
      outerfield[i][j] = cookie.substring(position, position + 1);
      if (outerfield[i][j] == player1) {
        getel(gettableid(i, j)).classList.add("winx");
      } else if (outerfield[i][j] == player2) {
        getel(gettableid(i, j)).classList.add("wino");
      }
    }
  }
}

function resetFieldCookie() {
  setCookie("game", "", 0);
}

//game field creation:
getel("wrapper").innerHTML += "<table id=field></table>";
let table = "";
for (let i = 0; i < 3; i++) {
  table += "<tr>";
  for (let j = 0; j < 3; j++) {
    let id = i + "" + j;

    table += "<td id='" + id + "'>";
    table += "<table>";
    for (let k = 0; k < 3; k++) {
      table += "<tr>";
      for (let l = 0; l < 3; l++) {
        let s = i + ", " + j + ", " + k + ", " + l;
        let id = i + "" + j + "" + k + "" + l;
        table +=
          "<td><div class='i' id='" +
          id +
          "' onmousedown='mousedown(" +
          s +
          ")'></div>";
        table += "</td>";
      }
      table += "</tr>";
    }
    table += "</table>";
    table += "</td>";
  }
  table += "</tr>";
}
getel("field").innerHTML = table;
setActiveField(true, 0, 0);
loadField();
asyncSaveField();
*/

getel("wrapper").innerHTML += "<table id=field></table>";
let table = "";
for (let i = 0; i < 3; i++) {
  table += "<tr>";
  for (let j = 0; j < 3; j++) {
    let id = i + "" + j;

    table += "<td id='" + id + "'>";
    table += "<table>";
    for (let k = 0; k < 3; k++) {
      table += "<tr>";
      for (let l = 0; l < 3; l++) {
        let s = i + ", " + j + ", " + k + ", " + l;
        let id = i + "" + j + "" + k + "" + l;
        table +=
          "<td><div class='i' id='" +
          id +
          "' onmousedown='mousedown(" +
          s +
          ")'></div>";
        table += "</td>";
      }
      table += "</tr>";
    }
    table += "</table>";
    table += "</td>";
  }
  table += "</tr>";
}
getel("field").innerHTML = table;

let game = new Game();

function mousedown(x, y, a, b) {
  game.set(x, y, a, b);
}