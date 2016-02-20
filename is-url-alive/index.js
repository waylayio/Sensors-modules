var unirest = require('unirest')
module.exports = function (options, send) {
  var url = options.requiredProperties.url || options.node.RESOURCE || options.task.RESOURCE
  var API_KEY = options.requiredProperties.key || options.globalSettings.MASHAPE_KEY

  console.log(url)
  if (url === undefined || url === '') {
    send(new Error('url not defined'))
  } else {
    // These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get('https://igor-zachetly-ping-uin.p.mashape.com/pinguin.php?address=' + url)
      .header('X-Mashape-Key', API_KEY)
      .end(function (result) {
        console.log(result.body)
        var pingResult = result.body
        var value = {
          observedState: pingResult.result === 'true' ? 'Alive' : 'NotAlive',
          rawData: {
            time: parseFloat(pingResult.time)
          }
        }
        send(null, value)
      })
  }

}
