var coap = require('coap')
module.exports = function (options, send) {
  var server = options.requiredProperties.server
  var path = options.requiredProperties.path
  server += '/' + path

  if (server !== undefined) {
    try {
      var req = coap.request(server)
      req.on('response', function (res) {
        console.log(res)
        var ret = res.payload
        var value = {
          observedState: 'Not Collected'
        }
        var payload = ret.toString('ascii')
        console.log('payload after conversion is ' + payload)
        if (!isNaN(payload))
          payload = parseFloat(payload)
        if (ret !== undefined) {
          value.rawData = {
            value: payload
          }
          value.observedState = 'Collected'
        }
        send(null, value)
      })
      req.end()
    } catch(err) {
      send(new Error(err))
    }
  } else {
    send(new Error('nissing inout argumnet server'))
  }

}
