var request = require('request')
module.exports = function (options, send) {
  var username = options.globalSettings.API_KEY
  var password = options.globalSettings.API_PASS
  var domain = options.requiredProperties.domain || options.node.RESOURCE || options.task.RESOURCE

  var start = new Date().getTime()

  var url = 'https://' + domain + '/api/ping'

  var options = {
    url: url,
    method: 'GET',
    auth: {
      user: username,
      password: password
    }
  }

  request(options, function (err, resp, body) {
    console.log(body)
    var end = new Date().getTime()
    var time = end - start
    value = {
      observedState: body == 'alive' ? 'Alive' : 'Not Alive',
      rawData: {
        time: time,
      }
    }
    send(null, value)
  })

}
