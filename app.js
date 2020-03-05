const X = "X";
const O = "O";

let cp = X;

function getel(element) {
  return document.getElementById(element);
}

function getelc(classname) {
  return document.getElementsByClassName(classname);
}

let activeField = {
  all: true,
  x: 0,
  y: 0
};

function switchPlayer() {
  if (cp == X) {
    cp = O;
  } else {
    cp = X;
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

function mousedown(x, y, a, b) {
  if (!activeField.all && !(activeField.x == x && activeField.y == y)) {
    return;
  }

  let id = x + "" + y + "" + a + "" + b;

  if (getel(id).innerHTML != "") {
    return;
  }

  getel(id).innerHTML = cp;
  setActiveField(false, a, b);

  switchPlayer();
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
        table += "<td id='" + id + "' onmousedown='mousedown(" + s + ")'>";
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
