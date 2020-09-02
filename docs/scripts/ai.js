
const DEFAULT_AI_DIFFICULTY = 1

// will be added to ai difficulty
const AI_DIFFICULTY_OFFSET = 2

function iterate(game, i, g, player) {
  if (i <= 0) {
    return g.score;
  }

  let xs = 0;
  let xe = game.size
  let ys = 0
  let ye = game.size
  if (!g.currentField.all) {
    xs = Math.floor(g.currentField.x);
    xe = Math.floor(g.currentField.x) + 1;
    ys = Math.floor(g.currentField.y);
    ye = Math.floor(g.currentField.y) + 1;
  }

  for (let x = xs; x < xe; x++) {
    for (let y = ys; y < ye; y++) {
      for (let a = 0; a < game.size; a++) {
        for (let b = 0; b < game.size; b++) {
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

          if (!cg.set(x, y, a, b)) continue;

          cg.score = iterate(game, i - 1, cg, player);

          g.score = cg.score;
        }
      }
    }
  }

  return g.score;
}

async function ai(game, difficulty = DEFAULT_AI_DIFFICULTY) {
  if (game.end) return 1;

  difficulty = parseInt(difficulty) || DEFAULT_AI_DIFFICULTY
  difficulty += AI_DIFFICULTY_OFFSET

  const totalFields = Math.pow(game.size, 4)
  let iterations = Math.floor(2000 * Math.pow(totalFields - game.progress, -2)) + difficulty - (3 - game.size) * (3 - game.size)
  iterations = Math.min(10, iterations)

  let xs = 0;
  let xe = game.size
  let ys = 0
  let ye = game.size
  if (!game.currentField.all) {
    xs = game.currentField.x;
    xe = game.currentField.x + 1;
    ys = game.currentField.y;
    ye = game.currentField.y + 1;
  }

  let paths = [];

  for (let x = xs; x < xe; x++) {
    for (let y = ys; y < ye; y++) {
      for (let a = 0; a < game.size; a++) {
        for (let b = 0; b < game.size; b++) {
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

          if (!cg.set(x, y, a, b)) continue;

          cg.score = iterate(game, iterations, cg, player, 0);

          let path = {
            x: x,
            y: y,
            a: a,
            b: b,
            score: cg.score
          }

          paths.push(path);
        }
      }
    }
  }

  // Finding the best score

  let bestScore = -Infinity;
  let scores = [];

  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];

    scores.push(path.score);

    if (path.score >= bestScore) {
      bestScore = path.score;
    }
  }

  // Put all with the best score in a list

  let bests = [];

  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];

    if (path.score >= bestScore) {
      bests.push(path);
    }
  }

  // Pick one randomly

  let bestPath = bests[Math.floor(Math.random() * bests.length)];

  game.set(bestPath.x, bestPath.y, bestPath.a, bestPath.b);

  return 0;
}

try {
  module.exports = ai;
} catch {

}
