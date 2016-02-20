var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  // tempNode.state
  var db = options.globalSettings.mongodb
  var token = options.requiredProperties.token || options.globalSettings.mongoKey

  var id
  try {
    id = options.rawData.GLOBAL[options.requiredProperties.id].split('.')[0]
  } catch(err) {
    id = options.requiredProperties.id
  }

  if (id !== undefined) {
    console.log(id)
    var url = 'https://api.mongolab.com/api/1/databases/' + db + '/collections/assets?apiKey=' + token
    var options = {
      url: url
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var data = JSON.parse(body)
        var item = __.find(data, function (asset) {if (asset.BuildingID == id) return asset;})

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
    send(new Error('Missing id'))
  }
}
