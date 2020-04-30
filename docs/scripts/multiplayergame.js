let lobbyToken = getCookie("currentLobbyToken")
let lobby = getLobby(lobbyToken)
let size = lobby.game.substring(0, lobby.game.indexOf("-"))
let listen = true

getel("lobbytitle").innerHTML = lobby.name

let owner = lobby.correlations[0].usertoken
let amIX = owner == token

function getopponentname(suffix) {
  if (lobby.opponentname == undefined) {
    return "waiting for players"
  } else {
    return lobby.opponentname + suffix
  }
}

if (amIX) {
  getel("oturn").innerHTML = getopponentname(" turn")
  getel("xturn").innerHTML = "your turn"
} else {
  getel("xturn").innerHTML = getopponentname(" turn")
  getel("oturn").innerHTML = "your turn"
}

// FRONTEND INTERFACE


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
    for (let _x = 0; _x < game.size; _x++) {
      for (let _y = 0; _y < game.size; _y++) {
        getel(getglobalid(_x, _y)).classList.remove("current");
      }
    }
    let el = getel(getglobalid(x, y));
    el.classList.add("current");
  },
  win: (x, y, a, b, player) => {
    let el = getel(getglobalid(x, y));

    el.classList.add("win");
    el.classList.add("win" + player);
  },
  globalWin: (player) => {
    let winText = ""
    if ((player == "X" && amIX) || (player == "O" && !amIX)) {
      winText = "You win"
    } else if ((player == "O" && amIX) || (player == "X" && !amIX)) {
      winText = getopponentname(" wins")
    } else if (player == "d") {
      winText = "Draw"
    } else if (player == "f") {
      winText = "Your opponent gave up"
    }

    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = winText;
  },
  draw: () => {
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Draw";
  }
}

// HTML PAGE


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

function mousedown(a, b, x, y) {
  listen = false
  setTimeout(function () {
    listen = true
  }, UPDATEDTIMER * 1000)
  if (!lobby.isyourturn) return
  let gameString = requestPlay(lobbyToken, a, b, x, y)

  if (gameString && gameString != "undefined") {
    game.fromString(gameString)
  }
}

const UPDATEDTIMER = 1
let game = new Game(frontendInterface, size);
game.fromString(lobby.game)

function update() {
  if (!listen) return

  lobby = spectate(lobbyToken)
  let gameString = lobby.game

  if (gameString && gameString != "undefined") {
    game.fromString(gameString)
  }
}
setInterval(update, UPDATEDTIMER * 1000)

function leave() {
  leaveLobby(lobbyToken)
  document.location.href = "./multiplayer.html"
}
