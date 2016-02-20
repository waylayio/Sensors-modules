module.exports = function (options, send) {
  var delay = options.requiredProperties.delay
  var startTime = new Date()
  if (delay === undefined)
    delay = 1

  var myVar = setTimeout(function () {myTimer()}, delay * 1000)

  function myTimer () {
    var d = new Date()
    value = {
      observedState: 'ON',
      rawData: {
        startTime: startTime.getTime(),
        endTime: d.getTime(),
        executionTime: d.getTime() - startTime.getTime()
      }
    }
    send(null, value)
  }

}
