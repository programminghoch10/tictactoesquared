let lobbyToken = getCookie("currentLobbyToken")
let lobby = getLobby(lobbyToken)
let size = lobby.game.substring(0, lobby.game.indexOf("-"))
let listen = true
let opponentrequestedrematch
let won = false

function clamp(str, len) {
  if (str.length > len - 3) {
    str = str.substring(0, len) + "..."
  }

  return str
}

getel("lobbytitle").innerHTML = clamp(lobby.name, 30)

if (lobby.name.length + lobby.opponentname.length >= 24) {
  document.body.classList.add("title-top")
}

let owner = lobby.correlations[0].usertoken
let amIX = owner == token
let amIO = false
if (lobby.correlations.length > 1) amIO = lobby.correlations[1].usertoken == token

function getopponentname(suffix) {
  if (lobby.opponentname == undefined) {
    return "waiting for players"
  } else {
    return clamp(lobby.opponentname, 20) + suffix
  }
}

function getPlayerName(i) {
  return other(lobby.correlations[i].usertoken).name
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
  setCurrentFieldAfter: (x, y, all) => {
    for (let _x = 0; _x < game.size; _x++) {
      for (let _y = 0; _y < game.size; _y++) {
        getel(getglobalid(_x, _y)).classList.remove("current");
      }
    }
    if (all) return
    let el = getel(getglobalid(x, y));
    el.classList.add("current");
  },
  win: (x, y, a, b, player) => {
    let el = getel(getglobalid(x, y));

    el.classList.add("win");
    el.classList.add("win" + player);
  },
  globalWin: (player) => {
    if (won) return
    won = true
    getel("game").classList.add("nocurrent");
    let winText = ""
    if ((player == "X" && amIX) || (player == "O" && amIO)) {
      winText = "You win"
    } else if ((player == "O" && amIX) || (player == "X" && amIO)) {
      winText = getopponentname(" wins")
    } else if (player == "d") {
      winText = "Draw"
    } else if (player == "f") {
      if (lobby.flags.includes("invite")) {
        winText = "Your opponent rejected your invite"
      } else {
        winText = "Your opponent gave up"
      }
    } else {
      if (lobby.playernames[player] != null) {
        winText = lobby.playernames[player] + " wins"
      } else {
        winText = "wins"
        getel("win-player").classList.add(player);
      }
    }

    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = winText;

    getel("icon-o").style.opacity = "0";
    getel("icon-x").style.opacity = "0";
  },
  draw: () => {
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Draw";
  },
  rematch: () => {
    document.location.href = document.location.href
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
  if (!game.isValid(a, b, x, y)) return
  lobby = requestPlay(lobbyToken, a, b, x, y)

  if (lobby.game && lobby.game != "undefined") {
    game.fromString(lobby.game)
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

  if (lobby.correlations.length == 1) {
    getel("rematchbutton").style.display = "none"
  }

  if (amIX) {
    getel("oturn").innerHTML = getopponentname(" turn")
    getel("xturn").innerHTML = "your turn"

    if (lobby.flags.includes("rematch1") && !opponentrequestedrematch) {
      opponentrequestedrematch = true
      addInfo("Rematch", "Your opponent requested a rematch", 1)
    }
  } else if (amIO) {
    getel("xturn").innerHTML = getopponentname(" turn")
    getel("oturn").innerHTML = "your turn"

    if (lobby.flags.includes("rematch0") && !opponentrequestedrematch) {
      opponentrequestedrematch = true
      addInfo("Rematch", "Your opponent requested a rematch", 1)
    }
  } else {
    getel("xturn").innerHTML = clamp(lobby.playernames.X, 20) + " turn"
    getel("oturn").innerHTML = clamp(lobby.playernames.O, 20) + " turn"
  }
}
setInterval(update, UPDATEDTIMER * 1000)

function leave() {
  leaveLobby(lobbyToken)
  document.location.href = "./multiplayer.html"
}

function _rematch() {
  rematch(lobbyToken)
  opponentrequestedrematch = true
  if (lobby.correlations.length == 1) {
    addInfo("Rematch", "There will be no rematch because your opponent left", 2)
  } else {
    addInfo("Rematch", "You requested a rematch.", 1)
  }
}

update()
