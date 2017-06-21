const fs = require("fs")
const fetch = require("./fetch")

module.exports = (storagePath, res) => {
  var data = []

  if (fs.existsSync(storagePath)) {
    data = JSON.parse(fs.readFileSync(storagePath, {encoding: "utf-8"}))
  } else {
    fs.writeFileSync(storagePath, JSON.stringify(data), {encoding: "utf-8"})
  }
  fetch.all(data, res)
}