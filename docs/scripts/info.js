function getel(name) { return document.getElementById(name) }

const _ESCAPECHARS = [
  { in: "&", out: "&amp;" },
  { in: "<", out: "&lt;" },
  { in: ">", out: "&gt;" },
  { in: "\"", out: "&quot;" },
  { in: "'", out: "&#39;" },
  { in: "%", out: "&#37;" },
]
function sanitizeString(string) {
  if (string == undefined || string == null || typeof string !== "string") return undefined
  _ESCAPECHARS.forEach(value => string = string.split(value.in).join(value.out))
  return string
}

document.body.innerHTML += `
<div class="infos" id="infos">
</div>`

let infoel = getel("infos")
let infos = []

// info level:
// 0 - none (grey)
// 1 - info (blue)
// 2 - warning (yellow)
// 3 - error (red)

function addInfo(title, text, level, callback, timeoutCallback) {
  let info = {
    title: title,
    text: text,
    level: level,
    closeCallback: callback,
    timeoutCallback: timeoutCallback
  }

  infos.push(info)

  let id = infos.length - 1

  setTimeout(function () {
    removeInfo(id, timeoutCallback)
  }, 10000)

  generateInner()
}

function removeInfo(id, callback) {
  setTimeout(function () {
    if (callback != null) callback()
    infos[id] = null
    generateInner()
  }, 200)

  let info = getel("info" + id)
  if (info) info.style.opacity = 0
}

function _close(i) {
  removeInfo(i, infos[i].closeCallback)
}

function generateInner() {
  let inner = ""

  let inc = 0
  for (let i = 0; i < infos.length; i++) {
    const info = infos[i];
    if (info == null) continue
    inc++

    if (inc > 10) {
      inner +=
        `
      <div class="info" id="info${i}">
        <p>...</p>
      </div>
      `
      break
    }

    let svg = ""
    switch (info.level) {
      default:
      case 0:
        break

      case 1:
        svg = `<i class="fas fa-info-circle fa-2x"></i>`
        break

      case 2:
        svg = `<i class="fas fa-exclamation-triangle fa-2x"></i>`
        break

      case 3:
        svg = `<i class="fas fa-times-circle fa-2x"></i>`
        break
    }

    info.title = sanitizeString(info.title)
    info.text = sanitizeString(info.text)

    inner +=
      `
    <div class="info color${info.level}" id="info${i}">
      <div class="svg">
        ${svg}
      </div>
      <div class="text">
        <h3>${info.title}</h3>
        <p>${info.text}</p>
      </div>
      <div class="close" onclick="_close(${i})"><i class="fas fa-times"></i></div>
    </div>
    `
  }

  infoel.innerHTML = inner
}
