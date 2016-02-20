var __ = require('lodash')
var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  /*
payload message is in format:
a = <test1.x>
b = "hello"
c = <test2.x.y>
*/

  if (options.requiredProperties.payload) {
    try {
      var array = __.compact(options.requiredProperties.payload.split(';'))
      var args = {}
      __.each(array, function (el) {
        var index = el.split('=')[0].trim()
        args[index] = waylayUtil.evaluateData(options, el.substring(el.indexOf('=') + 1))
      })

      var value = {
        observedState: 'done',
        rawData: args
      }
      send(null, value)
    } catch(err) {
      send(new Error(err))
    }
  } else {
    send(new Error('Missing property payload'))
  }

}
