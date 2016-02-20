var waylayUtil = require('@waylay/sandbox-util')
module.exports = function (options, send) {
  // code 40, clear code 41

  var timeout = waylayUtil.getProperty(options, 'timeout') || 300
  timeout *= 1000 // since UTC time is for delta
  var date = new Date()
  var now = date.getTime()
  var lastEventTime = waylayUtil.getCacheData(options, 'eventTime')
  var lastCode = waylayUtil.getCacheData(options, 'eventCode')
  var delta
  if (lastEventTime === undefined)
    delta = 1000000000 // first time execution
  else
    delta = parseFloat(now - lastEventTime) / 1000
  if (lastCode === undefined)
    lastCode = 41 // clear alarm

  var streamData = waylayUtil.getStreamData(options)

  if (streamData === undefined) { // that is just a polling, so let's check the cache
    console.log('call from the polling..')
    if (delta > timeout && lastCode === 40) {
      send(null, {observedState: 'Medium', rawData: { eventCode: lastCode,  eventTime: lastEventTime || now } })
    } else if (delta < timeout && lastCode === 40) {
      send(null, {observedState: 'Minor', rawData: { eventCode: lastCode,  eventTime: lastEventTime || now } })
    } else {
      send(null, {observedState: 'Clear', rawData: { eventCode: lastCode,  eventTime: lastEventTime || now} })
    }
  } else {
    console.log('call from the streaming data..')
    var eventCode = parseInt(streamData.eventCode)
    if (eventCode !== 40 && eventCode !== 41)
      send(new Error('Invalid code ' + eventCode))
    var eventTime = streamData.eventTime
    console.log('code=' + eventCode + ', previous=' + lastCode + ', delta=' + delta)
    if (eventCode === 40 && lastCode === 40 && delta < timeout) {
      send(null, {observedState: 'Critical', rawData: { eventCode: eventCode, eventTime: eventTime}})
    } else if (eventCode === 40 && lastCode === 41 && delta > timeout) {
      send(null, {observedState: 'Medium', rawData: { eventCode: eventCode, eventTime: eventTime}})
    } else if (eventCode === 40 && lastCode === 41 && delta < timeout) {
      send(null, {observedState: 'Minor', rawData: { eventCode: eventCode, eventTime: eventTime}})
    } else if (eventCode === 41 && lastCode === 40 && delta > timeout) {
      send(null, {observedState: 'Medium', rawData: { eventCode: eventCode, eventTime: eventTime}})
    } else {
      send(null, {observedState: 'Clear', rawData: { eventCode: eventCode, eventTime: eventTime}})
    }
  }

}
