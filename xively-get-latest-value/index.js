var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  /*
Example: for air quality in Gent
feed: 2005839140
id: PM2_5
*/

  var id = options.requiredProperties.id || options.node.RESOURCE || options.task.RESUOURCE

  var threshold = options.requiredProperties.threshold
  var key = options.globalSettings.XIVELY_KEY

  if (id !== undefined && threshold !== undefined && key !== undefined) {
    var httpOptions = {
      url: 'https://api.xively.com/v2/feeds/' + options.requiredProperties.feed,
      headers: {
        'X-ApiKey': key
      }
    }
    request(httpOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var var1 = JSON.parse(body)
        console.info(var1)
        var data = __.find(var1.datastreams, function (d) {
          return (d.id === id)
        })
        if (data !== undefined) {
          data.collectedTime = new Date(data.at).getTime()
          data.current_value = parseFloat(data.current_value)
          data.min_value = parseFloat(data.min_value)
          data.max_value = parseFloat(data.max_value)
          data.threshold = threshold
          var raw = {}
          if (data.current_value > threshold)
            raw.icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png'
          else
            raw.icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png'
          if (var1.location && var1.location.lat && var1.location.lon) {
            raw.latitude = var1.location.lat
            raw.longitude = var1.location.lon
          }
          __.map(var1.datastreams, function (data) {
            raw[data.id + '_current_value'] = parseFloat(data.current_value)
            raw[data.id + '_min_value'] = parseFloat(data.min_value)
            raw[data.id + '_max_value'] = parseFloat(data.max_value)
          // raw[data.id+'_collectedTime'] = new Date(data.at).getTime()
          })
          console.log(raw)
          value = {
            observedState: data.current_value > threshold ? 'Above' : 'Below',
            rawData: raw
          }
          send(null, value)
        } else {
          send(new Error('data for id ' + id + ' not found'))
        }
      }
    })
  } else {
    send(new Error('Missing properties'))
  }
}
