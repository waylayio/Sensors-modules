var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  /*var options = __.extend(options, { 
      rawData : {
          "hello" : {   
              randomValue: 5,
              state: "True" 
          }
      }
  });*/

  console.log('rawData sensor')
  console.log(options)
  var param = options.requiredProperties.parameter
  var node = options.requiredProperties.node
  if (node !== undefined && param !== undefined && options.requiredProperties.threshold !== undefined) {
    try {
      var rawValue = waylayUtil.evaluateData(options, node + '.' + param)
      console.log(rawValue)
      if (isNaN(rawValue))
        throw(new Error('Not a number: ' + rawValue))
      var state = 'Equal'
      if (rawValue > options.requiredProperties.threshold)
        state = 'Above'
      else if (rawValue < options.requiredProperties.threshold)
        state = 'Below'
      var value = {
        observedState: state,
        rawData: {  value: rawValue }
      }
      send(null, value)
    } catch(err) {
      send(new Error(err))
    }
  } else {
    send(new Error('Missing properties'))
  }

}
