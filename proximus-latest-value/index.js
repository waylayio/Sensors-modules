var request = require('request')
module.exports = function (options, send) {
  var props = options.requiredProperties
  var clientId = props.clientId || options.globalSettings.PROXIMUS_CLIENT_ID
  var clientSecret = props.clientSecret || options.globalSettings.PROXIMUS_CLIENT_SECRET
  var username = props.username || options.globalSettings.PROXIMUS_USERNAME
  var password = props.password || options.globalSettings.PROXIMUS_PASSWORD
  var device = props.device
  var stream = props.stream
  if (stream === undefined)
    stream = 1

  var getToken = function (callback) {
    var options = {
      url: 'https://login.enabling.be/oauth2/token',
      form: {
        username: username,
        password: password,
        grant_type: 'password'
      },
      headers: {
        Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64')
      }
    }
    var postCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        console.info(bodyJson)
        callback(null, bodyJson)
      } else {
        console.log(body)
        callback(new Error('Calling proximus api failed: ' + body + options.url))
      }
    }
    request.post(options, postCallback)
  }

  var getFirstDeviceData = function (payload, device, callback) {
    var options = {
      url: 'https://api.enabling.be/seaas/0.0.1/device/' + device + '/stream/' + stream + '/pop',
      headers: {
        'Authorization': 'Bearer ' + payload.access_token
      }
    }
    var getCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        var value = {
          observedState: 'Collected',
          rawData: bodyJson
        }
        send(null, value)
      } else {
        send(new Error('Calling proximus failed: ' + error + ' ' + body + options.url))
      }
    }
    request.get(options, getCallback)
  }

  if (clientId !== undefined && clientSecret !== undefined && username !== undefined && password !== undefined) {
    getToken(function (err, payload) {
      if (err) {
        send(err)
      } else {
        getFirstDeviceData(payload, device, function (err, data) {
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
