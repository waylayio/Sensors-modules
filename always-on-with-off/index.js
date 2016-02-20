module.exports = function (options, send) {
  var value = {
    observedState: 'ON'
  }
  send(null, value)
}
