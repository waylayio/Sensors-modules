var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  var state = 'Not Found'
  var disabledSensors = []
  var enabledSensors = []
  var disabledSensorsNames = []
  var enabledSensorsNames = []

  var sensors = waylayUtil.getRawData(options, options.requiredProperties.sensors)

  for (i = 0; i < sensors.length; i++) {
    var curSensor = sensors[i]
    if (curSensor.enabled == 'True') {
      enabledSensors.push(curSensor)
      enabledSensorsNames.push(curSensor.name)
    } else {
      disabledSensors.push(curSensor)
      disabledSensorsNames.push(curSensor.name)
    }
  }

  if (sensors.length === 0) {
    state = 'Not Found' // all sensors are disabled
  } else if (disabledSensors.length == sensors.length) {
    state = 'All' // all sensors are disabled
  } else if (disabledSensors.length === 0) {
    state = 'None' // no sensors are disabled
  } else if (disabledSensors.length < sensors.length) {
    state = 'Some' // some sensors are disabled
  }

  var value = {
    observedState: state,
    rawData: {
      disabledSensors: disabledSensors,
      enabledSensors: enabledSensors,
      disabledSensorsNames: disabledSensorsNames.join(', '),
      enabledSensorsNames: enabledSensorsNames.join(', ')
    }
  }
  send(null, value)
}
