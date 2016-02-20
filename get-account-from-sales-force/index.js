var waylayUtil = require('@waylay/sandbox-util')
var jsforce = require('jsforce')
module.exports = function (options, send) {
  var user = options.globalSettings.salesForceUser
  var token = options.globalSettings.salesForceToken
  var id = waylayUtil.evaluateData(options, options.requiredProperties.name)

  if (user === undefined || token === undefined || id === undefined) {
    send(new Error('token or user not defined'))
  } else {
    try {
      var conn = new jsforce.Connection()
      conn.login(user, token, function (err, res) {
        if (err) {
          console.error(err)
          send(new Error(err))
        } else {
          conn.sobject('Account').find({
            Name: id
          }, function (err, ret) {
            if (err) {
              console.error(err)
              send(new Error(err))
            } else {
              if (ret.length > 0)
                send(null, { observedState: 'Found', rawData: ret[0]})
              else
                send(null, { observedState: 'Not Found'})
            }
          })
        }
      })
    } catch(err) {
      console.error(err)
      send(new Error(err))
    }
  }

}
