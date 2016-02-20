var __ = require('lodash')
var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var username
  var authorizationToken
  if (__.isEmpty(options.requiredProperties.username)) {
    username = options.globalSettings.synfield_guest_username
  } else {
    try {
      username = waylayUtil.getRawData(options, options.requiredProperties.username)
    } catch (err) {
      username = options.requiredProperties.username
    }
  }
  if (__.isEmpty(options.requiredProperties.authorizationToken)) {
    authorizationToken = options.globalSettings.synfield_guest_authorizationToken
  } else {
    try {
      authorizationToken = waylayUtil.getRawData(options, options.requiredProperties.authorizationToken)
    } catch (err) {
      authorizationToken = options.requiredProperties.authorizationToken
    }
  }
  try {
    var url = 'http://api-synfield.synelixis.com/v1/sections/owner/' + username

    request({
      'uri': url,
      'headers': {
        'Authorization': authorizationToken,
        'Accept': 'application/json'
      }
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)

        var sections = []
        sections = data.response.sections

        // putting all the headNodes into an array for easy usage by other sensors
        var headNodes = []
        for (var i = 0; i < sections.length; i++) {
          headNodes.push(sections[i].headNode)
        }

        var value = {
          observedState: 'Found',
          rawData: {
            sections: sections,
            headNodes: headNodes,
            sectionsStr: JSON.stringify(sections)
          }
        }
        send(null, value)
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  } catch(err) {
    send(new Error(err))
  }
}
