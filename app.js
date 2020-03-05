/*
table classes:
active (green): only this is clickable
win (): this field has been won in and is no longer winnable


*/

const player1 = "X";
const player2 = "O";

let cp = player1;

function getel(element) {
  return document.getElementById(element);
}

function getelc(classname) {
  return document.getElementsByClassName(classname);
}

function gettableid(x, y) {
  return x + "" + y;
}

function getid(x, y, a, b) {
  return x + "" + y + "" + a + "" + b;
}

let activeField = {
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
  if (cp == player1) {
    cp = player2;
  } else {
    cp = player1;
  }
}

function setActiveField(all, a, b) {
  let id = gettableid(activeField.x, activeField.y);

  getel(id).classList.remove("active");

  activeField.all = all;
  activeField.x = a;
  activeField.y = b;

  if (all) return;

  id = gettableid(activeField.x, activeField.y);

  let empty = false;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let id = getid(activeField.x, activeField.y, i, j);
      if (getel(id).innerHTML == "") {
        empty = true;
      }
    }
  }

  if (!empty) {
    activeField.all = true;
    return;
  }

  getel(id).classList.add("active");
}

function checkWin(x, y, a, b, player) {
  let table = getel(gettableid(x, y));
  let counter1 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i, b);
    if (getel(id).innerHTML == player) {
      counter1++;
    }
  }
  let counter2 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, a, i);
    if (getel(id).innerHTML == player) {
      counter2++;
    }
  }
  let counter3 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i % 3, i % 3);
    if (getel(id).innerHTML == player) {
      counter3++;
    }
  }
  let counter4 = 0;
  for (let i = 0; i < 3; i++) {
    let id = getid(x, y, i % 3, 2 - (i % 3));
    if (getel(id).innerHTML == player) {
      counter4++;
    }
  }

  if (counter1 == 3 || counter2 == 3 || counter3 == 3 || counter4 == 3) {
    table.classList.add("win");
    table.classList.add("win" + player);

    outerfield[x][y] = 1;
    //TODO: check for global win. getel("win").classList.add("win-active") & getel("win").innerHTML = "X/O won"
    let counter1 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[x][i] == 1) {
        counter1++;
      }
    }
    let counter2 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i][y] == 1) {
        counter2++;
      }
    }
    let counter3 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i % 3][i % 3] == 1) {
        counter3++;
      }
    }
    let counter4 = 0;
    for (let i = 0; i < 3; i++) {
      if (outerfield[i % 3][2 - (i % 3)] == 1) {
        counter4++;
      }
    }

    if (counter1 == 3 || counter2 == 3 || counter3 == 3 || counter4 == 3) {
      getel("win").classList.add("win-active");
      getel("win").innerHTML = cp + " won.";
    }
  }
}

function mousedown(x, y, a, b) {
  /*if (!activeField.all && !(activeField.x == x && activeField.y == y)) {
    return;
  }*/

  let id = getid(x, y, a, b);

  if (getel(id).innerHTML != "" && getel(id).inner != " ") {
    return;
  }

  getel(id).innerHTML = cp; //TODO: remove. it has some bad effect on the style e.g. you can select it and see it and it changes the sizes of the fields
  getel(id).classList.add(cp);
  getel(id).classList.add("ox");
  if (!getel(gettableid(x, y)).classList.contains("win")) {
    checkWin(x, y, a, b, cp);
  }
  setActiveField(false, a, b);

  switchPlayer();

  saveField();
}

function reload() {
  resetFieldCookie();
  document.location.href = document.location.href;
}

function saveField() {
  let cookie = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          let field = getel(getid(i, j, k, l)).innerHTML;
          cookie += "" + (field == "" ? "-" : field);
        }
      }
    }
  }
  setCookie("game", cookie, 365);
}

function loadField() {
  let cookie = getCookie("game");
  if (cookie.length != 3 * 3 * 3 * 3) resetFieldCookie();
  if (cookie == "") return;
  let position = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          let field = getel(getid(i, j, k, l));
          let inner = cookie.substring(position, position + 1);
          if (inner != "-" && inner != "") {
            field.innerHTML = inner;
            field.classList.add(inner);
          }
          position++;
        }
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
loadField();

setActiveField(true, 0, 0);
