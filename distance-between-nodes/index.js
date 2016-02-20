var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  /*
var options = __.extend(options, {
    rawData : {
        "node1":{
            "latitude":"51",
            "longitude":"3.71"
        },"node2":{
            "latitude":"51.12",
            "longitude":"3.51"
        }
    }
})
*/

  var lat1, lat2, lon1, lon2
  if (options.requiredProperties.node1 && options.requiredProperties.node2) {
    var rawData = waylayUtil.getRawData(options, options.requiredProperties.node1)
    console.log(rawData)
    lat1 = rawData.latitude
    lon1 = rawData.longitude
    rawData = waylayUtil.getRawData(options, options.requiredProperties.node2)
    lat2 = rawData.latitude
    lon2 = rawData.longitude
  // you could as well get the data this way, but you would need 2 calls per node.
  // lat2 = waylayUtil.getRawData(options, options.requiredProperties.node2, lat2)
  }

  if (options.requiredProperties.distance && lat1 && lon1 && lat2 && lon2) {
    // option1 to calculate
    // var dist = waylayUtil.getDistance(lat1, lon1, lat2, lon2)
    // option2 to caclulate
    var dist = waylayUtil.getDistance(options, options.requiredProperties.node1, options.requiredProperties.node2)
    var value = {
      observedState: dist > options.requiredProperties.distance ? 'OUT' : 'IN',
      rawData: {
        distance: dist,
        distanceConfigured: options.requiredProperties.distance,
        latitude1: lat1,
        longitude1: lon1,
        latitude2: lat2,
        longitude2: lon2
      }
    }
    send(null, value)
  } else {
    send(new Error('Missing properties'))
  }

}
