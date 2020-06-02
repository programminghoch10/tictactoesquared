
const multiplayerpages = [
  "/multiplayer.html",
  "/multiplayergame.html",
  "/inputname.html",
];

window.onoffline = function () {
  console.log("Network connection has been lost!");
  disablemultiplayer();
};

window.ononline = function () {
  console.log("Network connection has been restored!");
  enablemultiplayer();
};

function disablemultiplayer() {
  let path = document.location.pathname
  if (multiplayerpages.includes(path)) {
    document.location.pathname = "/"
    return
  }
  if (path === "/") {
    let button = document.getElementById("onlinemultiplayerbutton")
    button.style = "text-decoration: line-through; cursor: not-allowed;"
    button.removeAttribute("href")
    document.getElementById("offlinetitle").innerText = "OFFLINE MODE"
  }
}

function enablemultiplayer() {
  let path = document.location.pathname
  if (path === "/") {
    let button = document.getElementById("onlinemultiplayerbutton")
    button.style = ""
    button.href = "multiplayer.html"
    document.getElementById("offlinetitle").innerText = ""
  }
}

if (document.location.hostname.endsWith("github.io") || !window.navigator.onLine) disablemultiplayer();
