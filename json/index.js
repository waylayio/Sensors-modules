module.exports = function (options, send) {
  if (options.requiredProperties.message) {
    var value = {
      observedState: 'done',
      rawData: JSON.parse(options.requiredProperties.message)
    }
    send(null, value)
  } else {
    send(new Error('Missing property message'))
  }

}
