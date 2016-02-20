var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  // sensors should never throw exceptions but instead send an error back
  var previous = waylayUtil.getCacheData(options, 'count')
  var newValue = 1
  if (previous !== undefined) {
    newValue = previous + 1
  }
  // you can reset the count via stream data.
  var reset = waylayUtil.getStreamData(options, 'reset')
  if (reset !== undefined) {
    console.log('reset call')
    newValue = 1
  }

  console.log('previous: ' + previous + ', new: ' + newValue)
  var result = {
    observedState: 'Incremented',
    rawData: {
      count: newValue
    }
  }
  send(null, result)

}
