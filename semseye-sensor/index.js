var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  var device = options.requiredProperties.device
  var organizationGUID = options.requiredProperties.organizationGUID

  var today = new Date().toISOString().slice(0, 10)
  var defaultStart = today + ' 00:00'
  var defaultEnd = today + ' 23:00'

  var startDate = options.requiredProperties.startDate || defaultStart
  var endDate = options.requiredProperties.endDate || defaultEnd
  var visits = options.requiredProperties.visits || 'h'

  var message = {
    serial: device,
    organizationGUID: organizationGUID,
    visits: visits,
    startDate: startDate,
    endDate: endDate
  }

  var requestOptions = {
    url: 'https://userportal.semseye.com:443/NodeService/getDeviceDataJson',
    json: message
  }

  request.post(requestOptions, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)

      var totalHourlyVisits = __.reduce(body.getDeviceDataJsonResult.hourlyVisitCountList, function (memo, num) { return memo + num.Value; }, 0)
      var totalDailyVisits = __.reduce(body.getDeviceDataJsonResult.dailyVisitCountList, function (memo, num) { return memo + num.Value; }, 0)

      send(null, {
        observedState: 'Found',
        rawData: {
          totalHourlyVisits: totalHourlyVisits,
          hourlyVisitCountList: body.getDeviceDataJsonResult.hourlyVisitCountList,
          dailyVisitCountList: body.getDeviceDataJsonResult.dailyVisitCountList,
          totalDailyVisits: totalDailyVisits,
          startDate: startDate,
          endDate: endDate
        }
      })
    } else {
      send(new Error('Error ' + error + ' ' + body))
    }
  })
}
