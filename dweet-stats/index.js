var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  var thing = options.requiredProperties.thing || options.node.RESOURCE || options.task.RESOURCE

  if (thing) {
    var url = 'https://dweet.io:443/get/dweets/for/' + thing
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // console.log(body)
        var data = JSON.parse(body).with
        var params = __.keys(data[0].content)
        console.log(params)
        var items = __.map(data, function (d) {return d.content})
        var L = items.length
        var x = __.reduce(items, function (acc, o) {
          for (var p in o) {
            acc['avg_' + p] = ('avg_' + p in acc ? acc['avg_' + p] : 0) + o[p]
            if (!acc['min' + '_' + p]) acc['min' + '_' + p] = 999999
            if (!acc['max' + '_' + p]) acc['max' + '_' + p] = -999999
            acc['min' + '_' + p] = acc['min' + '_' + p] < o[p] ? acc['min' + '_' + p] : o[p]
            acc['max' + '_' + p] = acc['max' + '_' + p] > o[p] ? acc['max' + '_' + p] : o[p]
          }
          return acc
        }, {})
        x.samples = L
        for (var p in x) {
          if (p.indexOf('avg_') === 0)
            x[p] = x[p] / L
        }
        console.log(items)
        var value = {
          observedState: 'Collected',
          rawData: x
        }
        console.log('value ' + value)
        send(null, value)
      } else {
        send(new Error('Error: ' + response))
      }
    })

  } else {
    send(new Error('Missing property thing'))
  }

}
