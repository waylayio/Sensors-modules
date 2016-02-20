var request = require('request')
module.exports = function (options, send) {
  var props = options.requiredProperties
  var token = props.access_token || options.globalSettings.spark_token

  if (token !== undefined && props.variable !== undefined && props.device !== undefined) {
    var options = {
      url: 'https://api.spark.io/v1/devices/' + props.device + '/' + props.variable,
      headers: {
        'Authorization: ': 'Bearer ' + token
      }
    }

    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        console.info(options.url)
        console.info(bodyJson)
        var value = {
          observedState: bodyJson.result ? 'Found' : 'Not Found',
          rawData: bodyJson
        }
        send(null, value)
      } else {
        send(new Error('Calling api.spark.io failed: ' + error + ' ' + body + options.url))
      }

    }

    request.get(options, callback)
  } else {
    send(new Error('Missing properties'))
  }

}
