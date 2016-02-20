var request = require('request')
module.exports = function (options, send) {
  var token = options.globalSettings.Carriots_key
  var device = options.requiredProperties.device

  if (token !== undefined && device !== undefined) {
    var options = {
      url: 'http://api.carriots.com/devices/' + device + '/streams',

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
          rawData: bodyJson,
          observedState: bodyJson.total_documents > 0 ? 'Found' : 'Not Found'
        }
        console.log(bodyJson)
        send(null, value)
      } else {
        send(new Error('Calling api.carriots.io failed'))
      }
    }

    request.get(options, callback)
  } else {
    send(new Error('Missing properties'))
  }

}
