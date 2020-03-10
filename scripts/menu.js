function getel(element) {
    return document.getElementById(element);
}

function mousedown(x, y, a, b) {

}

/*
getel("wrapper").innerHTML += "<table id=field></table>";
let table = "";
for (let i = 0; i < 3; i++) {
table += "<tr>";
for (let j = 0; j < 3; j++) {
    let id = i + "" + j;

    if (i == 1 && j == 1) {
        id += "' class='fullwidth";
    }

    table += "<td id='" + id + "'>";
    table += "<table>";
    for (let k = 0; k < 3; k++) {
        if (i == 1 && j == 1) {
            let s = i + ", " + j + ", " + 0 + ", " + 0;
            let id = i + "" + j + "" + 0 + "" + 0;

            table += "<tr>";
            table +=
                "<td><div class='i' id='" +
                id +
                "' onmousedown='mousedown(" +
                s +
                ")'>"
            table += ["Local game", "Against ai", "Online multiplayer" ][k];
            table += "</div>";
            table += "</tr>";

            continue;
        }

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
*/

getel("game").style.setProperty("--tilesize", 3);

let els = document.getElementsByClassName("free");

let currentPlayer = player1;

function switchPlayer() {
    if (currentPlayer == player1) {
        currentPlayer = player2;
    } else {
        currentPlayer = player1;
    }
}

function action() {
    let el = els[Math.floor(Math.random() * els.length)];

    console.log(el)

    if (el.classList.contains(player1)) {
        el.classList.remove(player1);
        el.classList.remove("ox");
        return;
    }
    
    if (el.classList.contains(player2)) {
        el.classList.remove(player2);
        el.classList.remove("ox");
        return;
    }

    el.classList.add(currentPlayer)
    el.classList.add("ox")

    switchPlayer()
}

for (let i = 0; i < els.length; i++) {
    const el = els[i];

    el.addEventListener("click", () => {
        if (el.classList.contains(player1)) {
            el.classList.remove(player1);
            el.classList.remove("ox");
            return;
        }
        
        if (el.classList.contains(player2)) {
            el.classList.remove(player2);
            el.classList.remove("ox");
            return;
        }

        el.classList.add(currentPlayer)
        el.classList.add("ox")
        switchPlayer();
    })
}

let menufreefields = document.getElementsByClassName("menufieldfree");
for (let i = 0; i < menufreefields.length; i++) {
    let table = "";
    table += "<table>";
    for (let j = 0; j < 3; j++) {
        table += "<tr>";
        for (let k = 0; k < 3; k++) {
            table += '<td><div class="i free"></div></td>';
        }
        table += "</tr>";
    }
    table += "</table>";
    menufreefields[i].innerHTML = table;
};

let menufreerows = document.getElementsByClassName("menufieldfreerow");
for (let i = 0; i < menufreerows.length; i++) {
    let row = "";
    row += "<tr>";
    for (let j = 0; j < 3; j++) {
        row += '<td><div class="i free"></div></td>';
    }
    row += "</tr>";
    menufreerows[i].innerHTML = row;
};

setInterval(function() { action() }, 2000);