var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  /*
Rainfall intensity is classified according to the rate of precipitation:
Light rain — when the precipitation rate is < 2.5 mm (0.098 in) per hour
Moderate rain — when the precipitation rate is between 2.5 mm (0.098 in) - 7.6 mm (0.30 in) or 10 mm (0.39 in) per hour[103][104]
Heavy rain — when the precipitation rate is > 7.6 mm (0.30 in) per hour,[103] or between 10 mm (0.39 in) and 50 mm (2.0 in) per hour[104]
Violent rain — when the precipitation rate is > 50 mm (2.0 in) per hour[104]
*/
  var lat
  var long
  try {
    lat = waylayUtil.evaluateData(options, options.requiredProperties.latitude)
    long = waylayUtil.evaluateData(options, options.requiredProperties.longitude)
  } catch(err) {
    lat = options.requiredProperties.latitude
    long = options.requiredProperties.longitude
  }

  if (lat === undefined || long === undefined) {
    send(new Error('No coordinates given'))
  } else {
    try {
      // This is the estimate per 5 minutes, 24 slots, in total 2 hours.
      var url = 'http://gps.buienradar.nl/getrr.php?lat=' + lat + '&lon=' + long
      console.log(url)

      request({
        'uri': url
      }, function (err, resp, body) {
        if (!err && resp.statusCode == 200) {
          var weatherArray = body.split('\r\n')
          console.log(weatherArray)
          var sum = __.reduce(weatherArray, function (memo, elem) {
            var array = elem.split('|')
            if (array.length == 2) {
              return parseFloat(memo + parseFloat(Math.pow(10, ((parseInt(array[0]) - 109) / 32))))
            }
            else
              return memo
          }, 0)
          console.log(sum.toFixed(1))
          var state = 'Rain'
          if (sum < 2.5)
            state = 'Dry'
          if (sum > 25)
            state = 'Storm'
          var value = {
            observedState: state,
            rawData: {
              neerslag: sum.toFixed(1)
            }
          }
          send(null, value)
        } else {
          console.log(resp)
          send(new Error(resp.statusCode))
        }
      })
    } catch(err) {
      send(new Error(err))
    }

  }

}
