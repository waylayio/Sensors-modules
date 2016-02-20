var request = require('request')
module.exports = function (options, send) {
  // price,volume,high,low,moving_avg,percent,date
  // 3.35,5660888,3.43,3.34,3.3319,-2.05%,12/10/14,4:03pm

  var price, volume, high, low, moving_average, percent, date
  var ticker = options.requiredProperties.ticker
  var threshold = options.requiredProperties.threshold
  if (ticker) {
    var url = 'http://finance.yahoo.com/d/quotes.csv?s=' + ticker + '&f=l1vhgm4p2d1t1'
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var res = body.split(',')
        price = parseFloat(res[0])
        if (isNaN(price))
          send(new Error('Bad response: ' + body))
        volume = Number(res[1])
        high = parseFloat(res[2])
        low = parseFloat(res[3])
        moving_average = parseFloat(res[4])
        percent = res[5].replace(/"/g, '')
        date = res[6].replace(/"/g, '')
        var value = {
          observedState: price > threshold ? 'Above' : 'Below',
          rawData: { price: price, high: high, volume: volume, low: low, movingAverage: moving_average,percent: percent, date: date, ticker: ticker, threshold: threshold }
        }
        console.log('value ' + value)
        send(null, value)
      } else {
        send(new Error('Error: ' + response))
      }
    })

  } else {
    send(new Error('Missing property stock'))
  }

}
