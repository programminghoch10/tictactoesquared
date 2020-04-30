document.body.innerHTML += `
<div class="infos" id="infos">
</div>`

let infoel = getel("infos")


let infos = []

function addInfo(title, text, callback, timeoutCallback) {
  let info = {
    title: title,
    text: text,
    closeCallback: callback,
    timeoutCallback: timeoutCallback
  }

  infos.push(info)

  let id = infos.length - 1

  // setTimeout(function () {
  //   removeInfo(id, timeoutCallback)
  // }, 10000)

  generateInner()
}

function removeInfo(id, callback) {
  setTimeout(function () {
    if (callback != null) callback()
    infos[id] = null
    generateInner()
  }, 200)

  getel("info" + id).style.opacity = 0
}

function _close(i) {
  removeInfo(i, infos[i].closeCallback)
}

function generateInner() {
  let inner = ""
  for (let i = 0; i < infos.length; i++) {
    const info = infos[i];
    if (info == null) continue

    inner +=
      `
    <div class="info" id="info${i}">
      <h3>${info.title}</h3>
      <p>${info.text}</p>
      <div class="close" onclick="_close(${i})"><i class="fas fa-times"></i></div>
    </div>
    `
  }

  infoel.innerHTML = inner
}
