var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  var venue_id
  try {
    venue_id = waylayUtil.getRawData(options, options.requiredProperties.venue_id)
  } catch (err) {
    if (!__.isEmpty(options.requiredProperties.venue_id)) {
      venue_id = options.requiredProperties.venue_id
    } else {
      send(new Error('Please specify venue ID.'))
    }
  }

  var foursquare_client_id = options.requiredProperties.foursquare_client_id || options.globalSettings.FOURSQUARE_CLIENT_ID
  var foursquare_client_secret = options.requiredProperties.foursquare_client_secret || options.globalSettings.FOURSQUARE_CLIENT_SECRET
  if (__.isEmpty(foursquare_client_id) || __.isEmpty(foursquare_client_secret)) {
    send(new Error('Please enter BOTH foursquare_client_id AND foursquare_client_secret found under your foursquare application.'))
  }

  var isHereNow_threshold = waylayUtil.evaluateData(options, options.requiredProperties.isHereNow_threshold) || options.requiredProperties.isHereNow_threshold
  var isHereNow_range = waylayUtil.evaluateData(options, options.requiredProperties.isHereNow_range) || options.requiredProperties.isHereNow_range
  isHereNow_threshold = parseInt(isHereNow_threshold)
  isHereNow_range = parseInt(isHereNow_range)
  if (isHereNow_threshold === undefined || isHereNow_range === undefined) {
    send(new Error('Please enter an integer for threshold and range.'))
  }

  try {
    var url = 'https://api.foursquare.com/v2/venues/' + venue_id
      + '?client_id=' + foursquare_client_id
      + '&client_secret=' + foursquare_client_secret
      + '&v=' + '20140805'

    request({
      'uri': url

    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)

        var hereNowCount = data.response.venue.hereNow.count

        if (hereNowCount > isHereNow_threshold + isHereNow_range) {
          state = 'Above'
        } else if (hereNowCount < isHereNow_threshold + isHereNow_range || hereNowCount > isHereNow_threshold - isHereNow_range || (hereNowCount === 0 && isHereNow_threshold === 0 && isHereNow_range === 0)) {
          state = 'In Range'
        } else {
          state = 'Below'
        }

        var addressStr
        var formattedAddress = data.response.venue.location.formattedAddress
        if (formattedAddress !== undefined && formattedAddress.length > 0) {
          addressStr = formattedAddress.join(', ')
        }

        var value = {
          observedState: state,
          rawData: {
            venueName: data.response.venue.name,
            hereNowCount: hereNowCount,
            stats_checkinsCount: data.response.venue.stats.checkinsCount,
            stats_usersCount: data.response.venue.stats.usersCount,
            stats_tipCount: data.response.venue.stats.tipCount,
            phone: data.response.venue.contact.formattedPhone,
            address: addressStr,
            verified: data.response.venue.verified,
            rating: data.response.venue.rating,
            threshold: isHereNow_threshold,
            range: isHereNow_range,
            venue_id: venue_id
          }
        }
        send(null, value)
      } else {
        send(new Error(response))
      }
    })
  } catch(err) {
    send(new Error(err))
  }
}
