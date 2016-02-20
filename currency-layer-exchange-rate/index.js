var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  var state = 'Not Found'
  var url
  var date = options.requiredProperties.date
  __.isEmpty(date) ? url = 'http://apilayer.net/api/live?' : url = 'http://apilayer.net/api/historical?date=' + date + '&'

  var accessKey = options.globalSettings.CURRENCYLAYER_APIKEY || options.requiredProperties.accessKey
  if (accessKey === undefined)
    send(new Error('Please specify accessKey.'))
  url += 'access_key=' + accessKey + '&'

  var currencies = options.requiredProperties.currencies
  if (currencies === undefined)
    send(new Error('Please specify currencies (e.g. USD,EUR,GBP)'))
  url += 'currencies=' + currencies

  var sourceCurrency = options.requiredProperties.sourceCurrency
  if (!__.isEmpty(sourceCurrency))
    url += '&source=' + sourceCurrency

  console.log(url)

  var value
  try {
    request({
      'uri': url,
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        if (data.success.toString() == 'true') {
          data.timestampUTC = new Date(data.timestamp).toUTCString()
          data.timestampISO = new Date(data.timestamp).toISOString()
          data.firstKey = Object.keys(data.quotes)[0]
          data.firstValue = data.quotes[data.firstKey]
          value = {
            observedState: 'Found',
            rawData: data
          }
        } else {
          value = {
            observedState: 'Not Found',
            rawData: data
          }
        }
        send(null, value)
      } else {
        console.log(response)
        send(new Error('Error: ' + err))
      }
    })
  } catch(err) {
    send(new Error(err))
  }
}
