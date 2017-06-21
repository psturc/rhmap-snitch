const fs = require("fs")
const request = require("request")
const winston = require("winston")

const init = require("./init")

async function addTarget(credentials, storagePath, expressResponse) {
  try {
    const response = await testTarget(credentials)
    if (response.statusCode <= 399) {
      updateConfig(credentials, storagePath)
    }
  } catch (err) {
    winston.error(err)
  } finally {
    init(storagePath, expressResponse)
  }
}

function updateConfig(target, storagePath) {
  let data
  if (fs.existsSync(storagePath)) {
    data = JSON.parse(fs.readFileSync(storagePath, {encoding: "utf-8"}))
    data.push(target)
    fs.writeFileSync(storagePath, JSON.stringify(data), {encoding: "utf-8"})
  } else {
    winston.info(`File not found in path ${storagePath}!`)
  }
}

async function testTarget(opt) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  let options = {
    url: `${opt.master_url}/oauth/authorize?client_id=openshift-challenging-client&response_type=token`,
    auth: {
      "user": opt.os_username,
      "pass": opt.os_password
    }
  }
  return new Promise((resolve, reject) => {
    request.post(options, (err, response) => {
      if (err) {
        reject(err)
      }
      resolve(response)
    })
  })
}

module.exports = {
  add: addTarget
}