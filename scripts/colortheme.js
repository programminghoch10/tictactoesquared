function dark() {
  document.body.classList.add("dark");

  setCookie("theme", 1, 365);
}

function light() {
  document.body.classList.remove("dark");

  setCookie("theme", 0, 365);
}

let cookie = getCookie("theme");

if (cookie == "") {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark");
  }
}

if (cookie == 1) {
  dark();
}
