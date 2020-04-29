let crypto = require("crypto")

module.exports = {
  hash: (value) => {
    let hash = crypto.createHash("sha256")
    hash.update(value)
    return hash.digest('hex')
  },
  getTime: () => {
    return Math.floor(new Date().getTime() / 1000)
  },
  isStringEmpty: (str) => {
    if (str == undefined) return true

    str = str.split(" ").join("")
    return str.length == 0
  },
}
