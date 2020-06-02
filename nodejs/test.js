const sql = require("./sql")
sql.init()

async function a() {
  let user = await sql.getUserBySecret("10cf88945ac60e45fe79896b999c2af540f53135d48f8f0c37566dc5b4cbf04a")
  console.log(user)
}

a()
