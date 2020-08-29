
const REQUEST_AI_TIMEOUT = 10000 //in ms, timeout after which client will resort to own calculations

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
    getel("game").classList.add("nocurrent");
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Won"
    getel("win-player").classList.add(player);

    if (size == 1) getel("win-text").innerHTML = "Won (obviously)"

    deleteGameCookie();
  },
  draw: () => {
    getel("win").classList.add("win-active");
    getel("win-text").innerHTML = "Draw"
  }
}

const size = parseInt(getCookie("fieldsize")) || 3
let game = new Game(frontendInterface, size);

document.title = Array(size).fill(null).map(() => "T").join("") + "² - AI";

function getel(element) {
  return document.getElementById(element);
}

function restart() {
  deleteGameCookie();
  reload();
}

function reload() {
  document.location.reload();
}

function mousedown(x, y, a, b) {
  game.set(x, y, a, b);

  if (game.currentPlayer == player2 && !game.debug) {
    let difficulty = parseInt(getCookie("aidifficulty")) || 3
    setTimeout(function () { requestai(game, difficulty); }, 0);
  }

  if (!game.end) {
    save();
  }
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
  let cookie = game.toString();

  setGameCookie(cookie);
}

function load() {
  let cookie = getGameCookie();

  if (!game.expectSize(cookie, size)) {
    deleteGameCookie()
    game = new Game(frontendInterface, size)
    return
  }

  if (!game.fromString(cookie)) {
    deleteGameCookie()
    game = new Game(frontendInterface, size)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestai(game, difficulty) {
  if (!clientOnline) return ai(game, difficulty)
  let formdata = { game: game.toString(), difficulty: difficulty }
  formdata = Object.keys(formdata).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(formdata[key]);
  }).join('&');
  let request = new Promise((resolve, reject) => {
    setTimeout(reject, REQUEST_AI_TIMEOUT)
    fetch("/api/requestai", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
      body: formdata
    }).then((data) => {
      resolve(data.text())
    }).catch(() => {
      reject()
    })
  });

  //workaround for below problem, try server first, else local
  let result = await (new Promise((resolve) => {
    request
      .then((result) => resolve(result))
      .catch(() => {
        resolve(
          ai(game, difficulty).then(() => {
            resolve(game.toString())
          }))
      })
  }))
  /*
  // This code would work perfectly, using the first result provided, whichever is faster (server or local device)
  // but js is not actually asynchronous, so this won't work,
  // as the result of the server can't be checked, whilst executing calculations
  let local = new Promise((resolve) => {
    setTimeout(() => {
      let localgame = game.clone()
      ai(localgame, difficulty).then(() => {
        resolve(localgame.toString())
      })
    }, 0)
  })
  var result;
  try {
    result = await Promise.any([request, local])
  } catch (e) {
    console.log("Promise.any not supported")
    result = await Promise.race([request, local])
  }
  console.log(request)
  console.log(local)
  */
  game.fromString(result)
  if (!game.end) {
    save();
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

getel("icon-o").innerHTML = "<p> AI's turn</p>"
getel("icon-x").innerHTML = "<p> your turn</p>"
