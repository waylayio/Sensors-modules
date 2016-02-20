var mssql = require('mssql')
module.exports = function (options, send) {
  var host = options.globalSettings.DB_HOST
  var user = options.globalSettings.DB_USER
  var password = options.globalSettings.DB_PASSWORD
  var table = options.requiredProperties.table
  var database = options.requiredProperties.database

  var config = {
    user: user,
    password: password,
    server: host,
    database: database,
    options: {
      encrypt: true // Use this if you're on Windows Azure
    }
  }

  try {
    mssql.connect(config, function (err) {
      if (err) {
        console.log('error, enable to connect')
        console.log(err)
        send(new Error(err))
      } else {
        var request = new sql.Request()
        console.log('request...')
        request.query('select * from Meter_ContactInfo', function (err, recordset) {
          if (err) {
            console.log('error...')
            console.log(err)
            send(new Error('error'))
          } else {
            var res = {
              observedState: 'Not Found'
            }
            console.log(recordset)
            res.observedState = 'Found'
            send(null, res)
          }
        })
      }
    })
  } catch(err) {
    console.log('Exception connection error:')
    console.log(err)
    send(new Error('error'))
  }
}
