var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  // url like : http://www.doschdesign.com/images2/Red-DVI-MovingPeople-Business.jpg
  var image = {image: options.requiredProperties.url}
  var TOKEN = options.globalSettings.SIGHTHOUND_TOKEN

  var url = 'https://api-developer.sighthound.com/v1/detections'

  var options = {
    url: url,
    json: image,
    headers: {
      'X-Access-Token': TOKEN
    }
  }

  request.post(options, function (error, response, body) {
    if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
      var objects = body.objects
      var state = objects.length > 0 ? 'Found' : 'Not Found'
      console.log(objects)
      var rawData = {}
      if (state == 'Found') {
        rawData.personCount = __.filter(objects, function (obj) {return obj.type == 'person';}).length
        rawData.faceCount = __.filter(objects, function (obj) {return obj.type == 'face';}).length
        rawData.objects = objects
      }

      send(null, { observedState: state,  rawData: rawData})
    } else {
      // console.log(response)
      send(new Error('Calling failed: ' + response))
    }
  })

}
