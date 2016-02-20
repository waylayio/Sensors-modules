var moment = require('moment-timezone')
module.exports = function (options, send) {
  // For timezone names, see http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  // examples:
  // * Europe/Brussels    ->  +1 or +2
  // * Pacific/Pago_Pago  -> -11
  // * Pacific/Kiritimati -> +14

  var timeZone = options.requiredProperties.timeZone
  if (!timeZone) {
    timeZone = 'Europe/Brussels'
  }
  var now = moment().tz(timeZone)
  if (now.tz() === undefined) {
    send(new Error('Unknown timezone: ' + timeZone), null)
  } else {
    var value = {
      observedState: now.isoWeekday() === 6 || now.isoWeekday() === 7 ? 'TRUE' : 'FALSE',
      rawData: {
        timestamp: now.valueOf(),
        year: now.year(),
        month: now.month() + 1,
        day: now.date(),
        hours: now.hour(),
        minutes: now.minute(),
        seconds: now.second(),
        dateString: now.toString()
      }
    }
    send(null, value)
  }
}
