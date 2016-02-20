var request = require('request')
module.exports = function (options, send) {
  var url = 'https://haveibeenpwned.com/api/v2/breachedaccount/' + options.requiredProperties.account
  try {
    request({
      'uri': url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'
      }
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        var value = {
          observedState: 'Breached',
          rawData: { data: data}
        }
        send(null, value)
      } else if (!err && response.statusCode == 404) {
        send(null, { observedState: 'Not Breached' })
      } else {
        console.log(response)
        send(new Error(response))
      }
    })
  } catch(error) {
    send(new Error(error))
  }

}
