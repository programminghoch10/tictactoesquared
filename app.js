//app.js 
//  contains all game scripts

let game = new Array(3).fill(null).map(
    () => new Array(3).fill(null).map(
        () => new Array(3).fill(null).map(
            () => new Array(3).fill(null).map(
                () => 0)
        )
    )
);

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

function getGameField(id) {
    return game[id.substring(0, 1)][id.substring(1, 2)][id.substring(2, 3)][id.substring(3, 4)];
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
            if (getGameField(id) == "") {
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
            getel("win").innerHTML = cp + " won.";
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
    if (!activeField.all && !(activeField.x == x && activeField.y == y)) {
        return;
    }

    let id = getid(x, y, a, b);

    if (getGameField(id) != "") {
        return;
    }

    game[x][y][a][b] = cp;
    getel(id).classList.add(cp);
    getel(id).classList.add("ox");
    if (!getel(gettableid(x, y)).classList.contains("win")) {
        checkWin(x, y, a, b, cp);
    }
    checkDraw();
    setActiveField(false, a, b);

    switchPlayer();

    asyncSaveField();
}

function restart(params) {
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
    cookie += cp;
    cookie += activeField.all == true ? 1 : 0;
    cookie += activeField.x + "" + activeField.y;

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

    cp = cookie.substring(position, position + 1);
    position++;
    activeField.all = cookie.substring(position, position + 1) == 1;
    position++;
    activeField.x = cookie.substring(position, position + 1);
    position++;
    activeField.y = cookie.substring(position, position + 1);

    if (!activeField.all) {
        getel(gettableid(activeField.x, activeField.y)).classList.add("active");
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