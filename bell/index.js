var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  var data = waylayUtil.getStreamData(options, options.requiredProperties.item) || options.requiredProperties.item
  try {
    data = waylayUtil.getRawData(options, options.requiredProperties.item)
  } catch (err) {
    console.log('input argument is not in the raw data')
  }

  if (data === undefined) {
    send(new Error('input argument not found'))
  } else {
    var openValue = data.toLowerCase().indexOf('on') > -1
    var closedValue = data.toLowerCase().indexOf('off') > -1
    if (!openValue && !closedValue) {
      send(new Error('Not found whether it is on or off'))
    } else {
      send(null, { observedState: openValue ? 'on' : 'off'})
    }
  }

}
