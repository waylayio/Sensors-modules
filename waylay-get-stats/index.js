var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  var thing = options.requiredProperties.resource || options.node.RESOURCE || options.task.RESOURCE
  var username = options.globalSettings.API_KEY
  var password = options.globalSettings.API_PASS
  var domain = options.requiredProperties.domain || 'app.waylay.io'
  var samples = options.requiredProperties.samples

  if (thing && domain && username && password) {
    var url = 'https://data.waylay.io/resources/' + thing + '/series?domain=' + domain
    var options = {
      url: url,
      method: 'GET',
      auth: {
        user: username,
        password: password
      }
    }

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // console.log(body)
        var data = JSON.parse(body)
        var params = __.keys(data)
        // console.log(params)
        var L = data.length
        if (!isNaN(samples)) {
          if (samples < L) {
            console.log('Using ' + samples + ' samples, instead of ' + L)
            L = samples
            data = __.last(data, samples)
          }
        }
        var x = __.reduce(data, function (acc, o) {
          for (var p in o) {
            if (!isNaN(o[p])) {
              acc[p + '_avg'] = (p + '_avg' in acc ? acc[p + '_avg'] : 0) + o[p]
              if (!acc[p + '_min']) acc[p + '_min'] = 999999
              if (!acc[p + '_max']) acc[p + '_max'] = -999999
              acc[p + '_min'] = acc[p + '_min'] < o[p] ? acc[p + '_min'] : o[p]
              acc[p + '_max'] = acc[p + '_max'] > o[p] ? acc[p + '_max'] : o[p]
            } /* this can be wrong in case that string is different between samples
                    else{
                    acc[p] = o[p]
                }*/
          }
          return acc
        }, {})
        x.samples = L
        x.data = data
        for (var p in x) {
          if (p.indexOf('_avg') > 0)
            x[p] = x[p] / L
        }
        console.log(data)
        var value = {
          observedState: 'Collected',
          rawData: x
        }
        send(null, value)
      } else {
        send(null, {observedState: 'Not Collected'})
      }
    })

  } else {
    send(new Error('Missing property resource'))
  }
}
