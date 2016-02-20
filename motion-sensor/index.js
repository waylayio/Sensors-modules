var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var username = options.globalSettings.API_KEY
  var password = options.globalSettings.API_PASS
  var domain = options.requiredProperties.domain || options.globalSettings.waylay_domain || 'app.waylay.io'
  var resource = options.requiredProperties.resource || waylayUtil.getResource(options)

  var sendResult = function (param) {
    console.log('param=' + param)
    var state
    if (param.event_type === 'movement')
      state = 'Motion'
    else if (param.event_type === 'person') {
      if (param.persons[0].is_known)
        state = 'Known Person'
      else
        state = 'Unknown Person'
    }
    else
      state = 'internal' // connection ....

    var value = {
      observedState: state,
      rawData: param
    }
    send(null, value)
  }

  try {
    if (domain !== undefined && username === undefined || password === undefined) {
      send(new Error('missing properites'))
    } else {
      var runtimeParam = waylayUtil.getStreamData(options)
      if (runtimeParam !== undefined) {
        console.log('runtime data : ' + runtimeParam)
        sendResult(runtimeParam)
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
              sendResult(rawData)
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
