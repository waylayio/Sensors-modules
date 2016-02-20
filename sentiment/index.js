var waylayUtil = require('@waylay/sandbox-util')
var unirest = require('unirest')
module.exports = function (options, send) {
  var API_KEY = options.globalSettings.MASHAPE_KEY
  if (options.requiredProperties.inputText && API_KEY) {
    var inputText = waylayUtil.evaluateData(options, options.requiredProperties.inputText)
    unirest.get('https://twinword-sentiment-analysis.p.mashape.com/analyze/?text=' + inputText)
      .header('X-Mashape-Key', API_KEY)
      .header('Accept', 'application/json')
      .end(function (result) {
        console.log(result.status, result.headers, result.body)
        var res = result.body
        var value = {
          observedState: res.type,
          rawData: res
        }
        send(null, value)
      })
  } else {
    send(new Error('Missing property'))
  }

}
