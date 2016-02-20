var request = require('request')
module.exports = function (options, send) {
  var token = options.requiredProperties.token || options.globalSettings.HUMAN_TOKEN
  var headers = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
  var url = 'https://api.humanapi.co/v1/human'

  request({
    method: 'GET',
    uri: url,
    headers: headers
  }, function (error, res, body) {
    var parsedResponse
    if (error) {
      send(new Error('Unable to connect to the Human API endpoint.'))
    } else {
      if (res.statusCode == 401) {
        console.info('Unauthorized request, validate access token')
        send(new Error('unauthorized'))
      } else {
        try {
          parsedResponse = JSON.parse(body)
        } catch (error) {
          send(new Error('Error parsing JSON response from Human API.'))
        }
        // At this point you can use the JSON object to access the results
        console.log('Latest measurement')
        console.log(parsedResponse.heartRate)
        var retValue = {observedState: 'Collected',
          rawData: parsedResponse
        }
        send(null, retValue)
      }
    }
  })
}
