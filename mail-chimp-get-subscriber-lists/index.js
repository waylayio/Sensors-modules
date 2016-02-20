var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  var APIKey = options.requiredProperties.APIKey || options.globalSettings.MAILCHIMP_APIKEY
  if (APIKey === undefined)
    send(new Error('Please specify APIKey.'))
  var dc = options.requiredProperties.datacenter || options.globalSettings.MAILCHIMP_DATACENTER
  if (dc === undefined)
    send(new Error('Please specify datacenter.'))

  var url = 'https://' + dc + '.api.mailchimp.com/3.0/lists/?apikey=' + APIKey

  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        try {
          var data = JSON.parse(body)
          if (__.isEmpty(data.lists)) { // if no lists are retrieved
            value = {
              observerdState: 'Not Found',
              rawData: data
            }
          } else {
            value = {
              observerdState: 'Found',
              rawData: {
                lists: data.lists,
                total_items: data.total_items,
                firstList: data.lists[0],
                lastList: data.lists[data.lists.length - 1],
                firstListId: data.lists[0].id,
                lastListId: data.lists[data.lists.length - 1].id,
                firstListName: data.lists[0].name,
                lastListName: data.lists[data.lists.length - 1].name
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
