const async = require("async")
const getToken = require("./token")
const request = require("request")
const winston = require("winston")

var dataToShow = {}

function fetch (url, token) {
  return new Promise((resolve, reject) => {
    var options = { url: url, headers: { "Authorization": "Bearer " + token } }
    request.get(options, (err, openshiftResponse) => {
      if (err) {
        reject(err)
      }
      resolve(openshiftResponse.body)
    })
  })
}

function fetchAll(data, res) {
  async.eachSeries(data, function(target, cb) {
    dataToShow[target.master_url] = { master_url: target.master_url }
    getToken(target)
      .then((token) => {
        dataToShow[target.master_url]["token"] = token
        return Promise.all([
          fetchRoutes(target, token),
          fetchCredentials(target, token)
        ])
      })
      .then(() => {        
        cb()
      })
  }, (err) => {
    if (err) {
      winston.error(err)
    }
    res.render("index", { targets: dataToShow })
  })
}

function fetchRoutes (target, token) {
  var items
  return new Promise((resolve) => {
    Promise.all([
      fetch(`${target.master_url}/oapi/v1/namespaces/rhmap-core/routes`, token),
      fetch(`${target.master_url}/oapi/v1/namespaces/rhmap-3-node-mbaas/routes`, token)
    ]).then((responses) => {
      for (var i in responses) {
        try {
          items = JSON.parse(responses[i]).items
          for (var j in items) {
            if (items[j].metadata.name === "rhmap") {
              dataToShow[target.master_url]["studio_url"] = `https://${items[j].spec.host}`
            }
            if (items[j].metadata.name === "mbaas") {
              dataToShow[target.master_url]["mbaas_url"] = `https://${items[j].spec.host}`
            }
          }
        } catch (parseError) {
          winston.warn(parseError)
        }
      }
      resolve()
    }).catch(resolve)
  })
}

function fetchCredentials (target, token) {
  var envVars
  return new Promise((resolve) => {
    Promise.all([
      fetch(`${target.master_url}/oapi/v1/namespaces/rhmap-core/deploymentconfigs/millicore`, token),
      fetch(`${target.master_url}/oapi/v1/namespaces/rhmap-3-node-mbaas/deploymentconfigs/fh-mbaas`, token)
    ]).then((responses) => {
      for (var i in responses) {
        try {
          envVars = JSON.parse(responses[i]).spec.template.spec.containers[0].env
          for (var j in envVars) {
            if (envVars[j].name === "FHMBAAS_KEY") {
              dataToShow[target.master_url]["fhmbaaskey"] = envVars[j].value
              break
            }
            if (envVars[j].name === "FH_ADMIN_USER_NAME") {
              dataToShow[target.master_url]["studio_username"] = envVars[j].value
            }
            if (envVars[j].name === "FH_ADMIN_USER_PASSWORD") {
              dataToShow[target.master_url]["studio_password"] = envVars[j].value
            }
          }
        } catch (parseError) {
          winston.warn(parseError)
        }
      }
      resolve()
    }).catch(resolve)
  })
}

module.exports = {
  all: fetchAll,
}