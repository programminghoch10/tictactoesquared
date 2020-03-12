let frontendInterface = {
  setTile: (x, y, a, b, currentPlayer) => {
    let el = getel(getid(x, y, a, b));

    el.classList.add(currentPlayer);
    el.classList.add("ox");
  },
  setCurrentPlayer: (player) => {
    if (player == player1) {
      getel("icon-o").style.display = "none";
      getel("icon-x").style.display = "inline-block";
    } else {
      getel("icon-o").style.display = "inline-block";
      getel("icon-x").style.display = "none";
    }
  },
  setCurrentFieldBefore: (x, y) => {
    let el = getel(getglobalid(x, y));
    el.classList.remove("current");
  },
  setCurrentFieldAfter: (x, y) => {
    let el = getel(getglobalid(x, y));
    el.classList.add("current");
  },
  win: (x, y, a, b, player) => {
    let el = getel(getglobalid(x, y));

    el.classList.add("win");
    el.classList.add("win" + player);
  },
  globalWin: (player) => {
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Won"
    getel("win-player").classList.add(player);
  },
  draw: () => {
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Draw"
  }
}

let game = new Game(frontendInterface);

function getel(element) {
  return document.getElementById(element);
}

function restart() {
  deleteGameCookie();
  reload();
}

function reload() {
  document.location.href = document.location.href;
}

function mousedown(x, y, a, b) {
  game.set(x, y, a, b);

  save();
}

function debug() {
  game.debug = !game.debug;

  if (game.debug) {
    getel("debug-notice").innerHTML = "Debug mode";
  } else {
    getel("debug-notice").innerHTML = "";
  }
}

function switchPlayer() {
  if (!game.debug) return;

  game.switchPlayers();
}

function save() {
  let cookie = "";
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let a = 0; a < size; a++) {
        for (let b = 0; b < size; b++) {
          let field = game.fields[x][y][a][b];
          cookie += "" + (field == "" ? "-" : field);
        }
      }
    }
  }
  cookie += game.currentPlayer;
  cookie += game.currentField.all == true ? 1 : 0;
  cookie += game.currentField.x + "" + game.currentField.y;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      cookie += game.globalField[i][j];
    }
  }

  setGameCookie(cookie);
}

function load() {
  let cookie = getGameCookie();
  cookie = cookie.replace(/([^-XO012])+/g, "");
  cookie = cookie.split("-").join(" ");

  if (cookie.length != size * size * size * size + size * size + 3) deleteGameCookie();
  if (cookie == "") return;

  let position = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let a = 0; a < size; a++) {
        for (let b = 0; b < size; b++) {
          let char = cookie.substring(position, position + 1);
          if (char != " " && char != "") {
            game.fields[x][y][a][b] = char;
            getel(getid(x, y, a, b)).classList.add(char);
          }
          position++;
        }
      }
    }
  }

  game.currentPlayer = cookie.substring(position, position + 1);
  position++;
  game.currentField.all = cookie.substring(position, position + 1) == 1;
  position++;
  game.currentField.x = cookie.substring(position, position + 1);
  position++;
  game.currentField.y = cookie.substring(position, position + 1);

  if (!game.currentField.all) {
    getel(getglobalid(game.currentField.x, game.currentField.y)).classList.add("current");
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      position++;
      game.globalField[i][j] = cookie.substring(position, position + 1);
      if (game.globalField[i][j] == player1) {
        getel(getglobalid(i, j)).classList.add("winx");
      } else if (game.globalField[i][j] == player2) {
        getel(getglobalid(i, j)).classList.add("wino");
      }
    }
  }
}

getel("wrapper").innerHTML += "<table id=field></table>";
let table = "";
for (let i = 0; i < size; i++) {
  table += "<tr>";
  for (let j = 0; j < size; j++) {
    let id = i + "" + j;

    table += "<td id='" + id + "'>";
    table += "<table>";
    for (let k = 0; k < size; k++) {
      table += "<tr>";
      for (let l = 0; l < size; l++) {
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
getel("game").style.setProperty("--tilesize", size);

load();
save();