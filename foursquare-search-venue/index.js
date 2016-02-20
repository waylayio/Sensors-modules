var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  var latitude_longitude, near_location, venue_name

  try {
    latitude_longitude = waylayUtil.getRawData(options, options.requiredProperties.latitude_longitude)
  } catch (err) {
    if (!__.isEmpty(options.requiredProperties.latitude_longitude))
      latitude_longitude = options.requiredProperties.latitude_longitude
  }

  try {
    near_location = waylayUtil.getRawData(options, options.requiredProperties.near_location)
  } catch (err) {
    if (!__.isEmpty(options.requiredProperties.near_location))
      near_location = options.requiredProperties.near_location
  }

  if (__.isEmpty(latitude_longitude) && __.isEmpty(near_location)) {
    send(new Error('Please specify EITHER latitude_longitude OR near_location.'))
  }
  if (!__.isEmpty(latitude_longitude) && !__.isEmpty(near_location)) {
    send(new Error('Please ener only one of EITHER latitude_longitude OR near_location, not both.'))
  }

  var foursquare_client_id = options.requiredProperties.foursquare_client_id || options.globalSettings.FOURSQUARE_CLIENT_ID
  var foursquare_client_secret = options.requiredProperties.foursquare_client_secret || options.globalSettings.FOURSQUARE_CLIENT_SECRET

  if (__.isEmpty(foursquare_client_id) || __.isEmpty(foursquare_client_secret))
    send(new Error('Please enter BOTH foursquare_client_id AND foursquare_client_secret found under your foursquare application.'))

  try {
    venue_name = waylayUtil.getRawData(options, options.requiredProperties.venue_name)
  } catch (err) {
    if (!__.isEmpty(options.requiredProperties.venue_name)) {
      venue_name = options.requiredProperties.venue_name
    } else {
      send(new Error('Please specify the name of the location you wish to search for.'))
    }
  }

  var foundVenueLocation, foundVenueName, venueId
  var ll_or_near
  var ll_or_near_value
  if (latitude_longitude !== undefined) {
    ll_or_near = 'll'
    ll_or_near_value = latitude_longitude
  } else {
    ll_or_near = 'near'
    ll_or_near_value = near_location
  }

  var url = 'https://api.foursquare.com/v2/venues/search'
    + '?' + ll_or_near + '=' + ll_or_near_value
    + '&query=' + venue_name
    + '&client_id=' + foursquare_client_id
    + '&client_secret=' + foursquare_client_secret
    + '&v=' + '20140805'

  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)

        var venues = data.response.venues

        var thisVenue = venues[0]
        foundVenueLocation = thisVenue.location
        foundVenueName = thisVenue.name
        venueId = thisVenue.id
        state = 'Found'

        var value = {
          observedState: state,
          rawData: {
            venues: data.response,
            venueLocation: foundVenueLocation,
            venueName: foundVenueName,
            venueId: venueId
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
