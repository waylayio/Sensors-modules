var request = require('request')
module.exports = function (options, send) {
  var thing = options.requiredProperties.thing || options.node.RESOURCE || options.task.RESOURCE
  if (thing) {
    var url = 'https://dweet.io:443/get/latest/dweet/for/' + thing
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var rawData = JSON.parse(body).with[0].content
        if (rawData['your_latitude'] && rawData['your_longitude']) {
          rawData['latitude'] = rawData['your_latitude']
          rawData['longitude'] = rawData['your_longitude']
          delete rawData['your_longitude']
          delete rawData['your_latitude']
        }
        var value = {
          observedState: 'Collected',
          rawData: rawData
        }
        console.log('value ' + value)
        send(null, value)
      } else {
        send(new Error('Error: ' + response))
      }
    })

  } else {
    send(new Error('Missing property thing'))
  }

}
