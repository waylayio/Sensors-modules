var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  var origin, destination, thresholdTimeSec

  origin = waylayUtil.getStreamData(options, options.requiredProperties.origin)
  if (__.isEmpty(origin)) {
    try {
      origin = waylayUtil.getRawData(options, options.requiredProperties.origin)
    } catch (err) {
      origin = options.requiredProperties.origin
    }
  }

  destination = waylayUtil.getStreamData(options, options.requiredProperties.destination)
  if (__.isEmpty(destination)) {
    try {
      destination = waylayUtil.getRawData(options, options.requiredProperties.destination)
    } catch (err) {
      destination = options.requiredProperties.destination
    }
  }

  thresholdTimeSec = waylayUtil.getStreamData(options, options.requiredProperties.thresholdTimeSec)
  if (__.isEmpty(thresholdTimeSec)) {
    try {
      thresholdTimeSec = waylayUtil.getRawData(options, options.requiredProperties.thresholdTimeSec)
    } catch (err) {
      thresholdTimeSec = options.requiredProperties.thresholdTimeSec
    }
  }

  if (origin === undefined || destination === undefined) {
    send(new Error('You need to specify origin and destination'))
  }
  if (thresholdTimeSec === undefined) {
    send(new Error('You need to enter thresholdTimeSec'))
  }

  var modeOfTransport = options.requiredProperties.modeOfTransport || 'driving'
  var transportModes = ['driving', 'walking', 'bicycling', 'transit']

  var API_Key = options.requiredProperties.API_Key

  // if modeOfTransport is not one of the transportModes, it defaults to driving
  if (!__.contains(transportModes, modeOfTransport.toLowerCase())) {
    send(new Error('wrong type selected, it should be one of ' + transportModes.join(',')))
  }

  try {
    var url = 'https://maps.googleapis.com/maps/api/directions/json'
    url += '?origin=' + origin
    url += '&destination=' + destination
    url += '&mode=' + modeOfTransport

    // if API_Key is given, concat the API_Key for google maps API for work users
    if (!__.isEmpty(API_Key)) {
      url += 'key=' + API_Key
    }

    request({
      'uri': url,
    /*method: 'GET',
    form: {
        origin: origin,
        destination: destination,
        mode: modeOfTransport
    }*/
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)

        var travelTimeSec = data.routes[0].legs[0].duration.value
        var travelDistranceMetres = data.routes[0].legs[0].distance.value

        data.travelTimeSec = travelTimeSec
        data.travelTimeMin = travelTimeSec / 60
        data.travelTimeHour = travelTimeSec / 3600
        data.travelDistranceMetres = travelDistranceMetres
        data.travelDistranceKM = travelDistranceMetres / 1000

        var observedState = 'Above'
        travelTimeSec < thresholdTimeSec ? observedState = 'Below' : 'Above'

        var value = {
          observedState: observedState,
          rawData: data
        }
        send(null, value)
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  } catch(err) {
    send(new Error(err))
  }

}
