var request = require('request')
module.exports = function (options, send) {
  var url = options.requiredProperties.url
  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        if (Array.isArray(data))
          data = {result: data}
        send(null, {observedState: 'Found', rawData: data})
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  } catch(err) {
    send(new Error(err))
  }

}
