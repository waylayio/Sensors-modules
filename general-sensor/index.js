var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var parameter = options.requiredProperties.parameter
  var upperBound = options.requiredProperties.upperBound
  var lowerBound = options.requiredProperties.lowerBound
  var username = options.globalSettings.API_KEY
  var password = options.globalSettings.API_PASS
  var domain = options.requiredProperties.domain || options.globalSettings.waylay_domain || 'app.waylay.io'
  var resource = options.requiredProperties.resource || waylayUtil.getResource(options)

  var runtimeParam

  var sendResult = function () {
    console.log('runtime=' + runtimeParam + ', upperBound= ' + upperBound + ', lowerBound=' + lowerBound)
    var value = {
      observedState: 'In Range',
      rawData: {
        parameter: runtimeParam,
        lowerBound: lowerBound,
        upperBound: upperBound
      }
    }
    if (runtimeParam > upperBound)
      value.observedState = 'Above'
    else if (runtimeParam < lowerBound)
      value.observedState = 'Below'
    send(null, value)
  }

  try {
    if (upperBound === undefined || lowerBound === undefined || parameter === undefined) {
      send(new Error('missing properites'))
    } else {
      runtimeParam = waylayUtil.getStreamData(options, parameter)
      if (runtimeParam !== undefined) {
        console.log('runtime data : ' + runtimeParam)
        sendResult()
      } else {
        if (domain !== undefined && username !== undefined && password !== undefined && resource !== undefined) {
          var url = 'https://data.waylay.io/resources/' + resource + '/current?domain=' + domain
          var options = {
            url: url,
            method: 'GET',
            auth: {
              user: username,
              password: password
            }
          }
          request(options, function (error, response, body) {
            console.log('check the cloud cache')
            if (!error && response.statusCode == 200) {
              console.log(body)
              var rawData = JSON.parse(body)
              console.log(rawData)
              runtimeParam = rawData[parameter]
              if (!isNaN(runtimeParam)) {
                sendResult()
              } else {
                send(new Error('param' + runtimeParam + 'not a number'))
              }
            } else {
              console.log(response)
              send(new Error('data not found'))
            }
          })
        } else {
          send(new Error('Missing properties'))
        }
      }
    }
  } catch(err) {
    send(new Error(err))
  }
}
