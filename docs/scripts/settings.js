const MINAIDIFFICULTY = 0
const MAXAIDIFFICULTY = 3
const MINFIELDSIZE = 1
const MAXFIELDSIZE = 4

const COLOR_THEME_ELS = [
  document.getElementById("theme-sun"),
  document.getElementById("theme-moon"),
  document.getElementById("theme-auto")
]

const AIDIFFICULTY_EL = document.getElementById("aidifficulty")
const FIELDSIZE_EL = document.getElementById("fieldsize")

let colorTheme = 0
let AIDifficulty = 3
let fieldSize = 3

function setTheme(i, dont_reload) {
  COLOR_THEME_ELS[colorTheme].classList.remove("button-active")

  if (i < 0 || i > 2) return

  colorTheme = i

  COLOR_THEME_ELS[colorTheme].classList.add("button-active")

  setThemeCookie(colorTheme == 2 ? "" : colorTheme)

  if (!dont_reload) document.location.reload()
}

function setAIDifficulty(i) {
  if (i < MINAIDIFFICULTY || i > MAXAIDIFFICULTY) return

  AIDifficulty = i

  AIDIFFICULTY_EL.innerHTML = AIDifficulty

  setGlobalCookie("aidifficulty", AIDifficulty)
}

function increaseAIDifficulty() {
  setAIDifficulty(AIDifficulty + 1)
}

function decreaseAIDifficulty() {
  setAIDifficulty(AIDifficulty - 1)
}

function setFieldSize(i) {
  if (i < MINFIELDSIZE || i > MAXFIELDSIZE) return

  fieldSize = i

  FIELDSIZE_EL.innerHTML = fieldSize

  setGlobalCookie("fieldsize", fieldSize)
}

function increaseFieldSize() {
  setFieldSize(fieldSize + 1)
}

function decreaseFieldSize() {
  setFieldSize(fieldSize - 1)
}

let themeCookie = getCookie("theme")
if (themeCookie == "") themeCookie = "2"
themeCookie = parseInt(themeCookie)
setTheme(themeCookie, true)
setAIDifficulty(parseInt(getCookie("aidifficulty")) || 3)
setFieldSize(parseInt(getCookie("fieldsize")) || 3)
