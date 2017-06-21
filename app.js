const bodyParser = require("body-parser")
const express = require("express")
const winston = require("winston")

const init = require("./lib/init")
const config = require("./lib/config")

const app = express()

const storagePath = "./data.json"
const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.listen(server_port, server_ip_address, () => {
  winston.info("Example app listening on port 8080!")
})
app.set("view engine", "pug")



app.get("/", (req, res) => {
  init(storagePath, res)
})

app.post("/", (req, res) => {
  var new_target = {
    master_url: req.body.master_url,
    os_username: req.body.os_username,
    os_password: req.body.os_password
  }
  config.add(new_target, storagePath, res)
})
