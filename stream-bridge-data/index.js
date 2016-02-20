var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  var streamdata = waylayUtil.getStreamData(options)
  if (streamdata === undefined) {
    send(new Error('streamdata not found'))
  } else {
    var value = {
      observedState: 'Collected',
      rawData: {
        streamData: streamdata
      }
    }
    send(null, value)
  }
}
