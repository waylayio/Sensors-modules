var __ = require('lodash')
var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var APIKey = options.requiredProperties.APIKey || options.globalSettings.MAILCHIMP_APIKEY
  if (__.isEmpty(APIKey))
    send(new Error('Please specify APIKey.'))
  var dc = options.requiredProperties.datacenter || options.globalSettings.MAILCHIMP_DATACENTER
  if (__.isEmpty(dc))
    send(new Error('Please specify datacenter.'))

  var list_id
  try {
    list_id = waylayUtil.getRawData(options, options.requiredProperties.list_id)
  } catch (err) {
    list_id = options.requiredProperties.list_id
  }
  if (__.isEmpty(list_id))
    send(new Error('Please specify list_id.'))

  var url = 'https://' + dc + '.api.mailchimp.com/3.0/lists/' + list_id + '/members?apikey=' + APIKey

  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        try {
          var data = JSON.parse(body)
          if (__.isEmpty(data.members)) { // if no lists are retrieved
            value = {
              observerdState: 'Not Found',
              rawData: data
            }
          } else {
            value = {
              observerdState: 'Found',
              rawData: {
                members: data.members,
                total_items: data.total_items
              }
            }
          }

          send(null, value)

        } catch(err) {
          send(new Error(err))
        }

      } else {
        console.log(response)
        send(new Error(err))
      }
    })
  } catch(err) {
    send(new Error(err))
  }
}
