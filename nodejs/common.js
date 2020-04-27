let crypto = require("crypto")

module.exports = {
    hash: (value) => {
        let hash = crypto.createHash("sha256")
        hash.update(value)
        return hash.digest('hex')
    },
    getTime: () => {
        return new Date().getTime()
    }
}