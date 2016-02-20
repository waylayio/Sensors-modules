var mysql = require('mysql')
module.exports = function (options, send) {
  var host = options.globalSettings.DB_HOST
  var user = options.globalSettings.DB_USER
  var password = options.globalSettings.DB_PASSWORD
  var database = options.globalSettings.DB_DATABASE

  if (options.requiredProperties.type != 'mysql') {
    send(null, { observedState: 'Not Supported'})
  } else if (options.requiredProperties.device) {
    try {
      var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
      })
      var res = {
        observedState: 'Not Found'
      }
      connection.connect()
      connection.query('select * from devices where deviceId =' + connection.escape(options.requiredProperties.device), function (err, rows, fields) {
        if (err) throw err
        for (var i in rows) {
          console.log(rows[i])
        }
        res.rawData = rows[0]
        if (rows.length > 0)
          res.observedState = 'Found'
        send(null, res)
      })
      connection.end()
    } catch(err) {
      console.log(err)
      send(new Error('error'))
    }
  } else {
    send(new Error('Missing property device'))
  }

}
