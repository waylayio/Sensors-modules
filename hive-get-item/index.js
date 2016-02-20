module.exports = function (options, send) {
  if (options.requiredProperties.server && options.requiredProperties.table) {
    client = nodeHive.for({ server: options.requiredProperties.server})
    client.fetch('SELECT * FROM ' + options.requiredProperties.table, function (err, data) {
      if (err) {
        send(new Error(err))
      } else {
        // console.log(data)
        send(null, { observedState: 'Found'})
      }
    })
  } else {
    send(new Error('missing properties'))
  }

}
