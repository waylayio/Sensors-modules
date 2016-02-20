var moment = require('moment-timezone')
var request = require('request')
module.exports = function (options, send) {
  var token = options.globalSettings.Cumulocity_Key
  var dateTo = options.requiredProperties.dateTo || moment().toISOString()
  var yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  var dateFrom = options.requiredProperties.dateFrom || moment(yesterday).toISOString()

  var source = options.requiredProperties.source

  if (token !== undefined && source !== undefined) {
    var options = {
      url: 'http://suathh.cumulocity.com/measurement/measurements/series?dateTo=' + dateTo + '&source=' + source + '&dateFrom=' + dateFrom,

      headers: {
        Authorization: 'Basic ' + token,
        Accept: 'application/json'
      }
    }

    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)

        var value = {
          rawData: bodyJson,
          observedState: Object.keys(bodyJson['values']).length > 0 ? 'Found' : 'Not Found'
        }

        send(null, value)
      } else {
        send(new Error('Calling api.cumulocity failed'))
      }
    }

    request.get(options, callback)
  } else {
    send(new Error('Missing token or source'))
  }

}
