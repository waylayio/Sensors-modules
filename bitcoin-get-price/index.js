var unirest = require('unirest')
module.exports = function (options, send) {
  var threshold = options.requiredProperties.threshold
  var API_KEY = options.globalSettings.MASHAPE_KEY
  var currency = options.requiredProperties.currency || 'USD'
  console.log(currency)
  if (currency != 'EUR' && currency != 'USD')
    currency = 'USD'

  unirest.get('https://community-bitcointy.p.mashape.com/average/' + currency).header('X-Mashape-Key', API_KEY).end(function (result) {
    var bitcoin = JSON.parse(result.body)
    var value = {
      observedState: bitcoin.value < threshold ? 'Below' : 'Above',
      rawData: {
        currency: bitcoin.currency,
        price: bitcoin.value
      }
    }
    send(null, value)
  })
}
