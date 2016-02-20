var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var props = options.requiredProperties

  var clientId = props.clientKey || options.globalSettings.DASHBOARD_KEY
  var clientSecret = props.clientSecret || options.globalSettings.DASHBOARD_SECRET

  var selector = props.selector
  var profile = props.profile || waylayUtil.getResource(options)

  var getToken = function (callback) {
    var options = {
      url: 'https://dashboard.waylay.io/api/token/lifx/' + profile,
      auth: {
        user: clientId,
        password: clientSecret
      }
    }

    try {
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var bodyJson = JSON.parse(body)
          console.info(bodyJson)
          callback(null, bodyJson)
        } else {
          callback(new Error('Calling lifx api failed: ' + error + ' ' + body + options.url))
        }
      })
    } catch(err) {
      callback(new Error('Calling lifx api failed: ' + err))
    }
  }

  var getState = function (token) {
    var url = 'https://api.lifx.com/v1/lights/' + selector + '/state'
    request.post(url, {
      auth: {
        'bearer': token
      }
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        send(null, {
          observedState: data.power === 'on' ? 'On' : 'Off',
          rawData: data
        })
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  }

  var getDeviceData = function (token) {
    console.log(token)
    if (token.accessToken !== undefined) {
      getState(token.accessToken)
    } else {
      send(new Error('Token for profile ' + profile + ' not valid'))
    }
  }

  if (clientId !== undefined && clientSecret !== undefined && selector !== undefined) {
    getToken(function (err, token) {
      if (err) {
        // send(err)
        // try with the old token
        if (tokenFromCache !== undefined) {
          console.log('try with an old token, since the request to the dashboard failed')
          getDeviceData({accessToken: tokenFromCache})
        } else {
          console.log(err.stack)
          send(new Error(err))
        }
      } else {
        getDeviceData(token)
      }
    })
  } else {
    send(new Error('Missing properties'))
  }

}
