module.exports = function (options, send) {
  var model = options.requiredProperties.model || 'res.partner'
  var id = options.requiredProperties.id
  var odoo_host = options.globalSettings.ODOO_HOST
  var odoo_db = options.globalSettings.ODOO_DB
  var odoo_user = options.globalSettings.ODOO_USER
  var odoo_password = options.globalSettings.ODOO_PASSWORD
  var odoo_protocol = options.globalSettings.ODOO_PROTOCOL || 'https'

  if (id === undefined || odoo_host === undefined || odoo_db === undefined ||
    odoo_user === undefined || odoo_password === undefined) {
    send(new Error('missing properties'))
  } else {
    var odoo = new odoo({
      protocol: odoo_protocol,
      host: odoo_host,
      database: odoo_db,
      username: odoo_user,
      password: odoo_password
    })

    try {
      odoo.connect(function (err) {
        if (err) {
          console.log(err)
          send(new Error(err))
        } else {
          odoo.get(model, id , function (err, entry) {
            if (err) {
              console.log(err)
              send(new Error(err))
            } else {
              console.log('entry', entry)
              send(null, { observedState: 'Found'})
            }
          })
        }
      })
    } catch (err) {
      console.log(err)
      send(new Error(err))
    }
  }

}
