/*
table classes:
active (green): only this is clickable
win (): this field has been won in and is no longer winnable


*/

const color1 = "X";
const color2 = "O";

let cp = color1;

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

function switchPlayer() {
  if (cp == color1) {
    cp = color2;
  } else {
    cp = color1;
  }
}

function setActiveField(all, a, b) {
  let id = activeField.x + "" + activeField.y;

  getel(id).classList.remove("active");

  activeField.all = all;
  activeField.x = a;
  activeField.y = b;

  if (all) return;

  id = activeField.x + "" + activeField.y;

  let empty = false;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let id = activeField.x + "" + activeField.y + "" + i + "" + j;
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

function checkWin(x, y, a, b) {
  //console.log("checkWin: checking " + getid(x, y, a, b));
  let player = getel(getid(x, y, a, b)).innerHTML;
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
  //console.log(getid(counter1, counter2, counter3, counter4));
  if (counter1 == 3 || counter2 == 3 || counter3 == 3 || counter4 == 3) {
    console.log("WON: " + getid(x, y, a, b));
    table.classList.add("win");
  }
}

function mousedown(x, y, a, b) {
  /*if (!activeField.all && !(activeField.x == x && activeField.y == y)) {
    return;
  }*/

  let id = getid(x, y, a, b);

  if (getel(id).innerHTML != "") {
    return;
  }

  getel(id).innerHTML = cp;
  getel(id).classList.add(cp);
  getel(id).classList.add("ox");
  if (!getel(gettableid(x, y)).classList.contains("win")) {
    checkWin(x, y, a, b);
  }
  setActiveField(false, a, b);

  //switchPlayer();
}
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
