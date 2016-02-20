var unirest = require('unirest')
module.exports = function (options, send) {
  var API_KEY = options.requiredProperties.key || options.globalSettings.MASHAPE_KEY
  var from = options.requiredProperties.from
  var to = options.requiredProperties.to

  console.log(url)
  if (from === undefined || to === undefined) {
    send(new Error('url not defined')) } else {
    var url = 'https://bestapi-waze-free-v1.p.mashape.com/routes?end=' + to + '&start=' + from
    // These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get(url)
      .header('X-Mashape-Key', API_KEY)
      .end(function (result) {
        console.log(result.body)
        var res = result.body
        var state = 'Found'
        if ('route response is empty' == res)
          state = 'Not Found'
        var value = {
          observedState: state,
          rawData: {
            travelTime: res
          }
        }
        send(null, value)
      })
  }

}
