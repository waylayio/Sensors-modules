var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  var previous = waylayUtil.getCacheData(options, 'state')
  var newValue = '1'
  if (previous === undefined || previous === '1') {
    newValue = 0
  }
  console.log('previous: ' + previous + ', new: ' + newValue)
  var result = {
    observedState: newValue
  }
  send(null, result)

}
