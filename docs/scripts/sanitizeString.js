const ESCAPECHARS = [
  { in: "&", out: "&amp;" },
  { in: "<", out: "&lt;" },
  { in: ">", out: "&gt;" },
  { in: "\"", out: "&quot;" },
  { in: "'", out: "&#39;" },
  { in: "%", out: "&#37;" },
]
function sanitizeString(string) {
  if (string == undefined || string == null || typeof string !== "string") return undefined
  ESCAPECHARS.forEach(value => string = string.split(value.in).join(value.out))
  return string
}
