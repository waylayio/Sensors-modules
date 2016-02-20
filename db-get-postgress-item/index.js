var pg = require('pg')
module.exports = function (options, send) {
  var user = options.globalSettings.PG_USER
  var pwd = options.globalSettings.PG_PASSWORD
  var host = options.globalSettings.HOST
  var database = options.globalSettings.DATABASE
  var input = options.requiredProperties.inputQuery || 'SELECT $1::int AS number'

  try {
    // var conString = "postgres://username:password@localhost/database"

    var conString = 'postgres://' + user + ':' + pwd + '@' + host + '/' + database

    // this initializes a connection pool
    // it will keep idle connections open for a (configurable) 30 seconds
    // and set a limit of 20 (also configurable)
    pg.connect(conString, function (err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err)
      }
      client.query(input, ['1'], function (err, result) {
        done()

        if (err) {
          console.log('error running query', err)
          send(new Error(err))
        } else {
          console.log(result.rows[0].number)
          var data = {
            observedState: 'Found',
            rawData: { data: result.rows[0]}
          }
          send(null, data)
        }
      })
    })

  } catch(err) {
    console.log(err)
    send(new Error(err))
  }

}
