var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  /*var options = __.extend(options, {
    rawData : {
        "node1":{
            "latitude":"51",
            "longitude":"3.71"
        },"GLOBAL":{
            "latitude":"51.12",
            "longitude":"3.51"
        }
    }
});*/

  // runtime data
  var latRuntime = waylayUtil.getStreamData(options, 'latitude')
  var lonRuntime = waylayUtil.getStreamData(options, 'longitude')
  var node = options.requiredProperties.node
  if (latRuntime === undefined || lonRuntime === undefined) {
    send(new Error('now runtime data'))
  } else {
    if (((options.requiredProperties.latitudeConfigured !== undefined && options.requiredProperties.longitudeConfigured !== undefined) || node !== undefined)
      && options.requiredProperties.distance !== undefined) {
      // take first runtime from global, that way you don't need to define a node that has raw data.
      // if you have more than one node that produces geo data, you should not do this
      var latConfigured = options.requiredProperties.latitudeConfigured
      var lonConfigured = options.requiredProperties.longitudeConfigured
      if (options.requiredProperties.node) {
        latConfigured = waylayUtil.getRawData(options, node, 'latitude')
        lonConfigured = waylayUtil.getRawData(options, node, 'longitude')
      }
      var dist = waylayUtil.getDistance(latRuntime, lonRuntime, latConfigured, lonConfigured)
      if (!isNaN(dist)) {
        var value = {
          observedState: dist > options.requiredProperties.distance ? 'OUT' : 'IN',
          rawData: {
            distance: dist,
            distanceConfigured: options.requiredProperties.distance,
            latitude: latRuntime,
            longitude: lonRuntime,
            latitudeConfigured: latConfigured,
            longitudeConfigured: lonConfigured
          }
        }
        send(null, value)
      } else {
        send(new Error('Error computing the distance'))
      }
    } else {
      send(new Error('Missing properties'))
    }
  }

}
