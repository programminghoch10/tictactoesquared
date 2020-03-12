function dark() {
  document.body.classList.add("dark");

  setThemeCookie(1);
}

function light() {
  document.body.classList.remove("dark");

  setThemeCookie(0)
}

let cookie = getThemeCookie();

if (cookie == "") {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark");
  }
}

if (cookie == 1) {
  dark();
}
