var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  /* uncomment for testing
var options = __.extend(options, {
    rawData : {
        "GLOBAL":{
            "TargetTemp":"70",
            "Time":"21.0",
            "BuildingID":"14.0",
            "Date":"6.00",
            "SystemAge":"21.0",
            "System":"8.00",
            "ActualTemp":"58.0"
        }
    }
})
*/

  console.log(options.rawData)

  var targetInput = options.requiredProperties.target
  var rangeInput = options.requiredProperties.range
  var runtimeParameter = options.requiredProperties.parameter

  var target = waylayUtil.getStreamData(options, targetInput) || targetInput
  var range = waylayUtil.getStreamData(options, rangeInput) || rangeInput

  if (range === undefined || target === undefined || runtimeParameter === undefined) {
    send(new Error('missing properites'))
  } else {
    try {
      var runtimeParam = waylayUtil.getStreamData(options, runtimeParameter)
      if (runtimeParam === undefined) {
        send(new Error('runtime parameter not found')) } else {
        var value = {
          observedState: 'In Range',
          rawData: {
            parameter: runtimeParam,
            target: target,
            range: range
          }
        }
        console.log('runtime=' + runtimeParam + ', target= ' + target + ', range=' + range)
        if (runtimeParam - target > range)
          value.observedState = 'Above'
        else if (target - runtimeParam > range)
          value.observedState = 'Below'
        send(null, value)
      }
    } catch(err) {
      send(new Error(err))
    }
  }

}
