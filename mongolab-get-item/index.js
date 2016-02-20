var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  var db = options.globalSettings.mongodb
  var token = options.globalSettings.mongoKey
  var collection = options.requiredProperties.collection
  var identifier = options.requiredProperties.identifier
  var item
  try {
    item = waylayUtil.getRawData(options, options.requiredProperties.item, 'item')
  } catch (err) {
    console.log('item not in the raw data')
  }
  if (item === undefined)
    item = waylayUtil.evaluateData(options, options.requiredProperties.item)

  item = item || options.requiredProperties.item || options.node.RESOURCE || options.task.RESOURCE || options.node.NAME

  if (item !== undefined && token !== undefined && db !== undefined && collection !== undefined && identifier !== undefined) {
    var url = 'https://api.mongolab.com/api/1/databases/' + db + '/collections/' + collection + '?apiKey=' + token
    var options = {
      url: url
    }
    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body)
        console.log(data)
        var itemDB = __.find(data, function (d) {
          if (Array.isArray(d[identifier]))
            return (d[identifier].indexOf(item) > -1)
          else
            return (d[identifier] == item)
        })
        var state = itemDB ? 'Found' : 'NotFound'
        var value = {
          observedState: state,
          rawData: itemDB
        }
        send(null, value)
      } else {
        send(new Error('Calling mongolab failed: ' + error + ' ' + body))
      }
    }
    request.get(options, callback)
  } else {
    send(new Error('Missing input parameters'))
  }
}
