var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
module.exports = function (options, send) {
  /*var options = __.extend(options, { 
    rawData : {
        "hello" : {   
            randomValue: 5,
            state: "True" ,
            array: ["hello", "world"],
            items : [{ name :'vele'}],
            data: [{temperature:21}, {temperature:24}]
        }
    }
});*/

  /*parameter can be:
  randomValue
  state
  array contains hello
  items[?(@.name == 'vele')]
  data[?(@.temperature === 21)]
  data[?(@.temperature &gt 21)]
  */
  // console.log(options)

  var param = options.requiredProperties.parameter
  var node = options.requiredProperties.node
  if (node !== undefined && param !== undefined) {
    try {
      var rest
      if (param.split(' ').length === 3 && param.split(' ')[1] == 'contains') {
        if (param.split(' ')[2] == 'node.NAME')
          rest = options.node.NAME
        if (param.split(' ')[2] == 'node.RESOURCE')
          options.node.RESOURCE
        rest = param.split(' ')[2]
        param = param.split(' ')[0]
      }
      var searchString = node + '.' + param
      var rawValue = waylayUtil.evaluateData(options, searchString)
      console.log(rawValue)
      if (rawValue === undefined || rawValue == searchString)
        rawValue = undefined
      if (rawValue !== undefined && rest !== undefined) {
        rawValue = rawValue[__.indexOf(rawValue, rest)]
      // rawValue = __.contains(rawValue[0], rest)
      }
      // empty array should also return NO
      if (Array.isArray(rawValue) && rawValue.length === 0)
        rawValue = undefined
      var value = {
        observedState: rawValue === undefined ? 'NO' : 'YES',
        rawData: {  value: rawValue }
      }
      send(null, value)
    } catch(err) {
      console.log('error')
      send(null, {observedState: 'NO'})
    }
  } else {
    send(new Error('Missing properties'))
  }

}
