function getel(element) {
    return document.getElementById(element);
}

function mousedown(x, y, a, b) {

}

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
getel("game").style.setProperty("--tilesize", 3);