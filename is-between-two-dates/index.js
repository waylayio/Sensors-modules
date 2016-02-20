var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  var fromDate, untilDate, eventDate, fromDateOffsetHours = 0
  var now = new Date().getTime()

  fromDateOffsetHours = options.requiredProperties.fromDateOffsetHours || 1 // default 1 hour

  // try get fromDate from rawdata in context, else get it from properties
  try {
    fromDate = waylayUtil.getRawData(options, options.requiredProperties.fromDate)
  } catch (err) {
    fromDate = options.requiredProperties.fromDate
  }
  if (isNaN(fromDate)) {
    fromDate = new Date(fromDate).getTime()
  } else {
    fromDate = parseInt(fromDate)
  }

  try {
    untilDate = waylayUtil.getRawData(options, options.requiredProperties.untilDate)
  } catch (err) {
    untilDate = options.requiredProperties.untilDate || (fromDate + fromDateOffsetHours * 3600000)
  }

  if (isNaN(untilDate)) {
    untilDate = new Date(untilDate).getTime()
  } else {
    untilDate = parseInt(untilDate)
  }

  try {
    eventDate = waylayUtil.getRawData(options, options.requiredProperties.eventDate)
  } catch (err) {
    eventDate = options.requiredProperties.eventDate || now
  }
  if (isNaN(eventDate)) {
    eventDate = new Date(eventDate).getTime()
  }

  if (isNaN(fromDate) || isNaN(untilDate) || isNaN(eventDate)) {
    send(new Error('Error in formating'))
  } else {
    var state = (eventDate > fromDate && eventDate < untilDate) ? 'Between' : 'Before'
    if (eventDate > untilDate) {
      state = 'After'
    }

    var value = {
      observedState: state,
      rawData: {
        fromDateEpoch: fromDate,
        untilDateEpoch: untilDate,
        eventDate: eventDate,
        fromDateOffsetHours: fromDateOffsetHours,
        fromDate: new Date(fromDate).toString(),
        untilDate: new Date(untilDate).toString()
      }

    }
    send(null, value)
  }

}
