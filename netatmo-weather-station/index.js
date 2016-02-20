var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  // Docs at https://dev.netatmo.com/doc
  //
  // Go to https://dev.netatmo.com/dev/createapp and create an app
  // add these global settings:
  // NETATMO_CLIENT_ID
  // NETATMO_CLIENT_SECRET
  //
  // We suggest to not use your main account but to share your account to a
  // waylay specific user with less rights (cog button -> invite station guest)
  //
  // Provide username and password on the sensor level or globally using
  // NETATMO_USERNAME
  // NETATMO_PASSWORD
  //
  // TODO see if we can get proper oauth2 going, but how will we do token refresh?
  // sensors can not modigy global settings

  var props = options.requiredProperties

  var clientId = props.clientId || options.globalSettings.NETATMO_CLIENT_ID
  var clientSecret = props.clientSecret || options.globalSettings.NETATMO_CLIENT_SECRET
  var username = props.username || options.globalSettings.NETATMO_USERNAME
  var password = props.password || options.globalSettings.NETATMO_PASSWORD
  var moduleName = props.moduleName

  var getToken = function (callback) {
    var options = {
      url: 'https://api.netatmo.net/oauth2/token',
      form: {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
        scope: 'read_station'
      }
    }
    var postCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        // console.info(bodyJson)
        // console.info(bodyJson.access_token)
        callback(null, bodyJson.access_token)
      } else {
        callback(new Error('Calling netatmo api failed: ' + error + ' ' + body + options.url))
      }
    }
    request.post(options, postCallback)
  }

  var getFirstDeviceData = function (token, moduleName, callback) {
    var options = {
      url: 'https://api.netatmo.net/api/devicelist',
      qs: {
        access_token: token
      }
    }
    var getCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        // console.info(bodyJson)
        var all = [].concat(bodyJson.body.modules, bodyJson.body.devices)
        var allFormatted = '[' + __.map(all, 'module_name') + ']'
        console.info("selecting '" + moduleName + "' from found devices: " + allFormatted)
        var theModule = __.find(all, {module_name: moduleName})
        if (theModule === undefined) {
          callback(new Error("Calling netatmo api failed: no module or device with name '" + moduleName + "', found " + allFormatted))
        } else {
          var value = {
            observedState: 'Found',
            rawData: theModule.dashboard_data
          }
          callback(null, value)
        }
      } else {
        callback(new Error('Calling netatmo api failed: ' + error + ' ' + body + options.url))
      }
    }
    request.get(options, getCallback)
  }

  if (clientId !== undefined && clientSecret !== undefined && username !== undefined && password !== undefined) {
    getToken(function (err, token) {
      if (err) {
        send(err)
      } else {
        getFirstDeviceData(token, moduleName, function (err, data) {
          if (err) {
            send(err)
          } else {
            send(null, data)
          }
        })
      }
    })
  } else {
    send(new Error('Missing properties'))
  }

}
