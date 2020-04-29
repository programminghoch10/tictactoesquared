// cookie.js
// contains cookie related scripts
const cookiesavedays = 365;
var gamecookiename = "game"; //needs to be variable to be changed if ai is enabled
const themecookiename = "theme";

function setCookie(cname, cvalue, exdays, path) {
  cvalue = btoa(cvalue);
  if (!cookiesAccepted()) return;
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=" + (path == "" ? "/" : path);
}

function setGameCookie(value) {
  setCookie(gamecookiename, value, cookiesavedays, window.location.pathname);
}

function setThemeCookie(value) {
  setCookie(themecookiename, value, cookiesavedays, "");
}

function setGlobalCookie(name, value) {
  setCookie(name, value, cookiesavedays, "");
}

function getCookie(cname) {
  return atob(getRawCookie(cname));
}

function getGameCookie() {
  return getCookie(gamecookiename);
}

function getThemeCookie() {
  return getCookie(themecookiename);
}

function getRawCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function deleteGameCookie() {
  setCookie(gamecookiename, "", 0, window.location.pathname);
}

function deleteThemeCookie() {
  setCookie(themecookiename, "", 0, "");
}

function cookiesAccepted() {
  let accepted = getRawCookie("cookies-accepted");
  if (accepted != "") return true;
  return false;
}
