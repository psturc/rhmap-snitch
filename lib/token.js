const request = require("request")

module.exports = (opt) => {
  return new Promise((resolve, reject) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    request.post(`${opt.master_url}/oauth/authorize?client_id=openshift-challenging-client&response_type=token`, {
      "auth": {
        "user": opt.os_username,
        "pass": opt.os_password
      }
    }, (err, res) => {
      if (err) {
        return reject(err)
      }
      var token = res.headers.location.split("&")[0].replace(/.*token=/g, "")
      resolve(token)
    })
  })
}