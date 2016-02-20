var request = require('request')
module.exports = function (options, send) {
  // EMnify Endpoint Connectivity Sensor

  if (options.requiredProperties.endpointId) {
    var baseUrl = 'https://cdn.emnify.net/api/v1/'
    var endpointId = options.requiredProperties.endpointId
    var authToken = options.globalSettings.EMNIFY_AUTH_TOKEN
    var options = {
      url: baseUrl + 'endpoint/' + endpointId + '/connectivity',
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    }

    request(options, function (err, resp, body) {
      if (resp.statusCode == 200) {
        var data = JSON.parse(body)

        var value = {
          observedState: data.status.description,
          rawData: data
        }

        send(null, value)
      } else {
        send(new Error('Received unexpected statusCode=' + resp.statusCode + ' from EMnify API'))
      }
    })

  } else {
    send(new Error('Missing property endpointId'))
  }

}
