var __ = require('lodash')
var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  /*var username
if (__.isEmpty(options.requiredProperties.username)) {
    username = options.globalSettings.synfield_guest_username
} else {
    username = waylayUtil.evaluateData(options, options.requiredProperties.username)
}*/

  var authorizationToken
  var headNode
  if (__.isEmpty(options.requiredProperties.authorizationToken)) {
    authorizationToken = options.globalSettings.synfield_guest_authorizationToken
  } else {
    try {
      authorizationToken = waylayUtil.getRawData(options, options.requiredProperties.authorizationToken)
    } catch (err) {
      authorizationToken = options.requiredProperties.authorizationToken
    }
  }

  if (__.isEmpty(options.requiredProperties.headNode)) {
    send(new Error('Please enter value for headNode.'))
  } else {
    try {
      headNode = waylayUtil.getRawData(options, options.requiredProperties.headNode)
    } catch (err) {
      headNode = options.requiredProperties.headNode
    }
  }

  var url = 'http://api-synfield.synelixis.com/v1/gateway/' + headNode + '/measurements/'

  /*
      manages fromDate and untilDate
  */
  var fromDate, untilDate

  // if both fromDate and untilDate are empty, defaults to yesterday to today
  if (__.isEmpty(options.requiredProperties.fromDate) && __.isEmpty(options.requiredProperties.untilDate)) {
    fromDate = new Date(new Date().getTime() - 86400); // new Date(new Date().getTime() - 86400) //creates a date one day before today
    untilDate = new Date()
    var fromMonthNumber = fromDate.getMonth() + 1
    var untilMonthNumber = untilDate.getMonth() + 1
    url += fromDate.getFullYear() + '-' + fromMonthNumber + '-' + fromDate.getDate()
    + '/' + untilDate.getFullYear() + '-' + untilMonthNumber + '-' + untilDate.getDate()

  } else {
    if (!__.isEmpty(options.requiredProperties.fromDate)) {
      try {
        fromDate = waylayUtil.getRawData(options, options.requiredProperties.fromDate)
      } catch (err) {
        fromDate = options.requiredProperties.fromDate
      }
    }
    if (!__.isEmpty(options.requiredProperties.untilDate)) {
      try {
        untilDate = waylayUtil.getRawData(options, options.requiredProperties.untilDate)
      } catch (err) {
        untilDate = options.requiredProperties.untilDate
      }
    }

    // if only either of fromDate and untilDate is provided, throw error
    if (!__.isEmpty(fromDate) && __.isEmpty(untilDate) || __.isEmpty(fromDate) && !__.isEmpty(untilDate)) {
      send(new Error('Please provided both fromDate and untilDate.'))
    }

  }
  // concat dates to url
  if (!__.isEmpty(fromDate) && !__.isEmpty(untilDate)) {
    // validate date
    if (!isDate(fromDate) || !isDate(untilDate)) {
      send(new Error('Please provide in the yyyy-MM-dd format.'))
    } else {
      url += fromDate + '/' + untilDate + '/'
    }
  }

  /*
      manages offset and limit
  */
  var offset, limit
  if (!__.isEmpty(options.requiredProperties.offset)) {
    try {
      offset = waylayUtil.getRawData(options, options.requiredProperties.offset)
    } catch (err) {
      offset = options.requiredProperties.offset
    }
  }
  if (!__.isEmpty(options.requiredProperties.limit)) {
    try {
      limit = waylayUtil.getRawData(options, options.requiredProperties.limit)
    } catch (err) {
      limit = options.requiredProperties.limit
    }
  }

  if (!__.isEmpty(offset) || !__.isEmpty(limit)) {
    url += '?'
  }
  if (!__.isEmpty(offset)) {
    url += 'offset=' + offset
  }
  if (!__.isEmpty(offset) && !__.isEmpty(limit)) {
    url += '&'
  }
  if (!__.isEmpty(limit)) {
    url += 'limit=' + limit
  }

  console.log(url)

  try {
    request({
      'uri': url,
      'headers': {
        'Authorization': authorizationToken,
        'Accept': 'application/json'
      }
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)

        /*
        get the latest measurement of each sensor
        */
        var measurements = data.response.measurements
        var battArr = []
        var sysTempArr = []
        var solarRadLevelArr = []
        var windSpeedArr = []
        var windDirArr = []
        var rainArr = []
        var airTempArr = []
        var airHumidArr = []
        var foilMoistArr = []
        var soilMoistArr = []
        var otherArr = []

        for (var i = 0; i < measurements.length; i++) {
          var curM = measurements[i]
          var curMService = curM.service

          if (curMService === 'Battery') {
            battArr.push(curM)
          } else if (curMService === 'System temperature') {
            sysTempArr.push(curM)
          } else if (curMService === 'Solar radiation level') {
            solarRadLevelArr.push(curM)
          } else if (curMService === 'Wind speed') {
            windSpeedArr.push(curM)
          } else if (curMService === 'Wind direction') {
            windDirArr.push(curM)
          } else if (curMService === 'Rain') {
            rainArr.push(curM)
          } else if (curMService === 'Air temperature') {
            airTempArr.push(curM)
          } else if (curMService === 'Air humidity') {
            airHumidArr.push(curM)
          } else if (curMService === 'Foil moisture') {
            foilMoistArr.push(curM)
          } else if (curMService === 'Soil moisture') {
            soilMoistArr.push(curM)
          } else {
            otherArr.push(curM)
          }
        }

        var value = {
          observedState: 'Found',
          rawData: {
            links: data.response.links,
            otherMeasurements: data.response.otherArr,
            batteryMeasures: battArr,
            systemtempMeasures: sysTempArr,
            solarradlevelMeasures: solarRadLevelArr,
            windspeedMeasures: windSpeedArr,
            winddirMeasures: windDirArr,
            rainMeasures: rainArr,
            airtempMeasures: airTempArr,
            airhumidityMeasures: airHumidArr,
            foilmoistureMeasures: foilMoistArr,
            soilmoistureMeasures: soilMoistArr,
            sectionName: data.response.name,
            timezone: data.response.timezone
          }
        }
        send(null, value)
      } else {
        send(new Error('Could not load the url' + url + ' , got the error ' + err))
      }
    })
  } catch(err) {
    send(new Error(err))
  }

  function isDate (txtDate) {
    var IsoDateRe = new RegExp('^([0-9]{4})-([0-9]{2})-([0-9]{2})$')
    var matches = IsoDateRe.exec(txtDate)
    if (!matches) return false

    var composedDate = new Date(matches[1], (matches[2] - 1), matches[3])

    return ((composedDate.getMonth() == (matches[2] - 1)) &&
    (composedDate.getDate() == matches[3]) &&
    (composedDate.getFullYear() == matches[1]))
  }
}
