module.exports = function (options, send) {
  var randomValue = Math.random()
  var state
  if (randomValue >= 0.5)
    state = 'HEADS'
  else
    state = 'TAILS'

  value = {
    observedState: state,
    rawData: {  randomValue: randomValue}
  }
  send(null, value)
}
