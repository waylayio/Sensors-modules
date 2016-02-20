var request = require('request')
module.exports = function (options, send) {
  var thing = options.task.TASK_ID
  var username = options.globalSettings.API_KEY
  var password = options.globalSettings.API_PASS
  var domain = options.requiredProperties.domain || 'app.waylay.io'

  if (thing && domain && username && password) {
    var url = 'https://data.waylay.io/resources/' + thing + '/current?domain=' + domain

    var options = {
      url: url,
      method: 'GET',
      auth: {
        user: username,
        password: password
      }
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var rawData = JSON.parse(body)
        var value = {
          observedState: 'Collected',
          rawData: rawData
        }
        console.log('value ' + value)
        send(null, value)
      } else {
        console.log(response)
        send(null, {observedState: 'Not Collected'})
      }
    })

  } else {
    send(new Error('Missing properties'))
  }

}
