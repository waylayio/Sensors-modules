var request = require('request')
module.exports = function (options, send) {
  var token = options.globalSettings.Carriots_key
  var device = options.requiredProperties.device

  if (token !== undefined && device !== undefined) {
    var options = {
      url: 'http://api.carriots.com/devices/' + device,

      headers: {
        'carriots.apikey': token,
        'Content-Type': 'application/json',
        'User-Agent': device
      }
    }

    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)

        var value = {
          observedState: bodyJson.enabled ? 'Enabled' : 'Disabled',
          rawData: bodyJson
        }

        console.log(bodyJson.enabled)
        send(null, value)
      } else {
        send(null, {observedState: 'Not Found'})
      }

    }

    request.get(options, callback)
  } else {
    send(new Error('Missing properties'))
  }

}
