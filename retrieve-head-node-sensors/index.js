var __ = require('lodash')
var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var authorizationToken, headNode
  if (__.isEmpty(options.requiredProperties.authorizationToken)) {
    authorizationToken = options.globalSettings.synfield_guest_authorizationToken
  } else {
    authorizationToken = options.requiredProperties.authorizationToken

  }

  if (__.isEmpty(options.requiredProperties.headNode)) {
    send(new Error('Please enter value for headNode.'))
  } else {
    try {
      headNode = waylayUtil.getRawData(options, options.requiredProperties.headNode)
    } catch (err) {
      headNode = options.requiredProperties.headNode
    }
  }

  var url = ' http://api-synfield.synelixis.com/v1/gateway/' + headNode + '/sensors/'

  try {
    request({
      'uri': url,
      'headers': {
        'Authorization': authorizationToken,
        'Accept': 'application/json'
      }
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body), sensors = data.response.sensors
        var sensorsIDs = [], sensorsServices = [], sensorsNames = [], sensorsStr = []

        for (var i = 0; i < sensors.length; i++) {
          sensorsIDs.push(sensors[i].id)
          sensorsServices.push(sensors[i].service)
          sensorsNames.push(sensors[i].name)
          sensorsStr.push(sensors[i].id)
          sensorsStr.push(sensors[i].name)
          sensorsStr.push(sensors[i].service)
          sensorsStr.push(sensors[i].enabled)
        }

        namesStr = sensorsNames.join(', ')
        servicesStr = sensorsServices.join(', ')
        idsStr = sensorsIDs.join(', ')
        sensorsStr = sensorsStr.join(', ')

        var value = {
          observedState: 'Found',
          rawData: {
            sensors: sensors,
            namesStr: namesStr,
            servicesStr: servicesStr,
            idsStr: idsStr,
            sensorsStr: sensorsStr
          }
        }
        send(null, value)
      } else {
        console.log(response)
        send(new Error('Could not load the url' + url + ' , got the error ' + err))
      }
    })
  } catch(err) {
    send(new Error(err))
  }
}
