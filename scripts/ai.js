function iterate(i, g, player) {
    if (i <= 0) return g.score;

    let xs = 0;
    let xe = 3
    let ys = 0
    let ye = 3;
    if (g.currentField.all) {
        let xs = game.currentField.x;
        let xe = game.currentField.x + 1;
        let ys = game.currentField.y;
        let ye = game.currentField.y + 1;
    }

    for (let x = xs; x < xe; x++) {
        for (let y = ys; y < ye; y++) {
            for (let a = 0; a < 3; a++) {
                for (let b = 0; b < 3; b++) {
                    let cg = g.clone();

                    cg.frontendinterface.win = (x, y, a, b, cp) => {
                        if (player == cp) {
                            cg.score += Math.pow(10, i);
                        } else {
                            cg.score -= Math.pow(10, i);
                        }
                    }
                    cg.frontendinterface.globalWin = (cp) => {
                        if (player == cp) {
                            cg.score += Math.pow(100, i);
                        } else {
                            cg.score -= Math.pow(100, i);
                        }
                    }

                    if (!cg.set(cg.currentField.x, cg.currentField.y, a, b)) continue;

                    cg.score = iterate(i - 1, cg, player);

                    g.score = cg.score;
                }
            }

            return g.score;
        }
    }
}

function ai() {
    let bestPath;

    let iterations = Math.floor(2000 * Math.pow(81 - game.progress, -2)) + 2;
    console.log(iterations)

    let xs = 0;
    let xe = 3
    let ys = 0
    let ye = 3;
    if (game.currentField.all) {
        let xs = game.currentField.x;
        let xe = game.currentField.x + 1;
        let ys = game.currentField.y;
        let ye = game.currentField.y + 1;
    }

    for (let x = xs; x < xe; x++) {
        for (let y = ys; y < ye; y++) {
            for (let a = 0; a < 3; a++) {
                for (let b = 0; b < 3; b++) {
                    let cg = game.clone();

                    const player = cg.currentPlayer;
                    cg.frontendinterface.win = (x, y, a, b, cp) => {
                        if (player == cp) {
                            cg.score += Math.pow(10, iterations);
                        } else {
                            cg.score -= Math.pow(10, iterations);
                        }
                    }
                    cg.frontendinterface.globalWin = (cp) => {
                        if (player == cp) {
                            cg.score += Math.pow(100, iterations);
                        } else {
                            cg.score -= Math.pow(100, iterations);
                        }
                    }

                    let x = cg.currentField.x;
                    let y = cg.currentField.y;

                    if (!cg.set(cg.currentField.x, cg.currentField.y, a, b)) continue;

                    cg.score = iterate(iterations, cg, player, 0);

                    let path = {
                        x: x,
                        y: y,
                        a: a,
                        b: b,
                        score: cg.score
                    }

                    if (bestPath == null) {
                        bestPath = path;
                    } else if (path.score == bestPath.score) {
                        if (Math.floor(Math.random() * 4) == 1) {
                            bestPath = path;
                        }
                    } else if (path.score > bestPath.score) {
                        bestPath = path;
                    }
                }
            }
        }
    }

    mousedown(bestPath.x, bestPath.y, bestPath.a, bestPath.b);
}