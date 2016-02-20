var waylayUtil = require('@waylay/sandbox-util')
var unirest = require('unirest')
module.exports = function (options, send) {
  /*var options = __.extend(options, {
    rawData : {
    "GLOBAL":{
            "latitude":"51.12",
            "longitude":"3.51"
        }
    }
})
*/
  var latitude, longitude, runtimeLatitude, runtimeLongitude

  var sendDistance = function () {
    var dist = waylayUtil.getDistance(latitude, longitude, runtimeLatitude, runtimeLongitude)
    var value = {
      observedState: dist > options.requiredProperties.distance ? 'OUT' : 'IN',
      rawData: {
        distance: dist,
        distanceConfigured: options.requiredProperties.distance,
        latitude: runtimeLatitude,
        longitude: runtimeLongitude,
        latitudeConfigured: latitude,
        longitudeConfigured: longitude

      }
    }
    send(null, value)
  }

  latitude = waylayUtil.getCacheData(options, 'latitudeConfigured')
  longitude = waylayUtil.getCacheData(options, 'longitudeConfigured')

  try {
    runtimeLatitude = waylayUtil.getStreamData(options, 'latitude')
    runtimeLongitude = waylayUtil.getStreamData(options, 'longitude')
  } catch(err) {
    send(new Error(err))
  }

  if (!runtimeLatitude || !runtimeLongitude) {
    send(new Error('runtime location not available'))
  }
  else if (latitude && longitude) {
    try {
      sendDistance()
    } catch(err) {
      console.log('ERROR')
      send(new Error('calling mashape endpoint'))
    }
  }
  else if (options.requiredProperties.address && options.globalSettings.MASHAPE_KEY &&
    options.requiredProperties.distance && runtimeLongitude && runtimeLatitude) {
    var API_KEY = options.globalSettings.MASHAPE_KEY
    unirest.get('https://montanaflynn-geocoder.p.mashape.com/address?address=' + options.requiredProperties.address).header('X-Mashape-Key', API_KEY).end(function (result) {
      try {
        console.log(result.body)
        latitude = result.body['latitude']
        longitude = result.body['longitude']
        sendDistance()
      } catch (err) {
        send(new Error(err))
      }

    }, function () {
      console.log('ERROR')
      send(new Error('calling mashape endpoint'))
    })
  } else {
    send(new Error('Missing properties'))
  }

}
