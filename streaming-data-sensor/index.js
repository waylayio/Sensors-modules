var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  // added complete stream data in the response
  var streamdata = waylayUtil.getStreamData(options)

  var threshold = waylayUtil.getStreamData(options, options.requiredProperties.threshold) || options.requiredProperties.threshold

  if (threshold === undefined) {
    send(new Error('threshold parameter not found'))
  } else {
    try {
      var runtimeParam = waylayUtil.getStreamData(options, options.requiredProperties.parameter)
      if (runtimeParam === undefined) {
        send(new Error('runtime parameter not found'))
      } else {
        console.log('runtime=' + runtimeParam + ', threshold= ' + threshold)
        var value = {
          observedState: 'Equal',
          rawData: {
            parameter: runtimeParam,
            threshold: threshold,
            data: streamdata
          }
        }
        if (runtimeParam - threshold > 0)
          value.observedState = 'Above'
        else if (runtimeParam - threshold < 0)
          value.observedState = 'Below'
        send(null, value)
      }
    } catch(err) {
      send(new Error(err))
    }
  }

}
