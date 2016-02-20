var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  // tempNode.state 
  var db = options.globalSettings.mongodb
  var token = options.requiredProperties.token || options.globalSettings.mongoKey

  var country
  try {
    country = waylayUtil.getRawData(options, options.requiredProperties.country, 'country')
  } catch(err) {
    country = options.requiredProperties.country
  }

  if (country) {
    var url = 'https://api.mongolab.com/api/1/databases/' + db + '/collections/hvacSupport?apiKey=' + token
    var options = {
      url: url
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var data = JSON.parse(body)
        var item = __.find(data, function (person) {if (person.countries.indexOf(country) > -1) return person;})

        var value = {
          observedState: item !== undefined ? 'Found' : 'Not Found',
          rawData: item
        }
        console.log('value ' + value)
        send(null, value)
      } else {
        console.log(response)
        send(new Error(response))
      }
    })
  } else {
    send(new Error('Missing country'))
  }
}
