module.exports = function (options, send) {
  if (!options.requiredProperties.script || options.requiredProperties.script.indexOf('send') < 0) {
    send(new Error('script not correct!, you need to send back at least this: send(null, {observedState : .....})'))
  } else {
    try {
      eval(options.requiredProperties.script)
    } catch(err) {
      send(new Error(err))
    }
  }

}
