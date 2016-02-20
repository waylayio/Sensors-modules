module.exports = function (options, send) {
  var randomValue = Math.random()
  var state
  if (randomValue > 0.85)
    state = 'ONE'
  else if (randomValue > 0.7)
    state = 'TWO'
  else if (randomValue > 0.55)
    state = 'THREE'
  else if (randomValue > 0.4)
    state = 'FOUR'
  else if (randomValue > 0.25)
    state = 'FIVE'
  else
    state = 'SIX'
  value = {
    observedState: state,
    rawData: {  randomValue: randomValue}
  }
  send(null, value)
}
