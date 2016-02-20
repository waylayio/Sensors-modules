var twitter = require('twitter')
var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
module.exports = function (options, send) {
  var OAuthConsumerKey = options.globalSettings.OAuthConsumerKey
  var OAuthConsumerSecret = options.globalSettings.OAuthConsumerSecret
  var OAuthAccessToken = options.globalSettings.OAuthAccessToken
  var OAuthAccessTokenSecret = options.globalSettings.OAuthAccessTokenSecret

  var client = new twitter({
    consumer_key: OAuthConsumerKey,
    consumer_secret: OAuthConsumerSecret,
    access_token_key: OAuthAccessToken,
    access_token_secret: OAuthAccessTokenSecret
  })

  var searchTerms = options.requiredProperties.searchTerms
  var user = options.requiredProperties.user
  var query = {q: searchTerms, count: 100}
  var since_id, url
  var ignoreFirstSearch = false

  if (user === undefined) {
    url = 'search/tweets'
  } else {
    url = 'statuses/user_timeline.json'
    query.screen_name = user
  }

  /*
  This problem is avoided by setting the since_id parameter to the greatest ID of all the Tweets 
  your application has already processed. Unlike max_id the since_id parameter is not inclusive, 
  so it is not necessary to adjust the ID in any way. As shown in the following image, 
  Twitter will only return Tweets with IDs higher than the value passed for since_id.
  */

  since_id = waylayUtil.getCacheData(options, 'since_id')
  if (since_id) {
    query['since_id'] = since_id
  } else { // it is a first call, check if we should ignore first time search
    if (options.requiredProperties.ignoreFirstSearch || options.requiredProperties.ignoreFirstSearch == 'TRUE' ||
      options.requiredProperties.ignoreFirstSearch == 'true')
      ignoreFirstSearch = true
  }

  if (searchTerms) {
    try {
      client.get(url, query, function (error, tweets, response) {
        // console.log(tweets)
        if (user === undefined) {
          tweets = tweets.statuses
        }
        // console.log(tweets)
        var latestTweet = __.max(tweets, function (tweet) { return tweet.id; })
        // DO I need to do this? Really strange! Query doesn't work on per user bases
        tweets = __.filter(tweets, function (tweet) {if (tweet.text.toLowerCase().indexOf(searchTerms.toLowerCase()) > -1
            && tweet.text.toLowerCase().indexOf('@') < 0) return tweet; })

        var value = {
          observedState: tweets.length > 0 && !ignoreFirstSearch ? 'Found' : 'Not Found',
          rawData: {}
        }
        if (latestTweet && latestTweet.id)
          value.rawData['since_id'] = latestTweet.id
        else if (since_id)
          value.rawData['since_id'] = since_id
        if (ignoreFirstSearch) {
          value.rawData['count'] = 0
          value.rawData['tweets'] = []
        } else {
          value.rawData['count'] = tweets.length
          value.rawData['tweets'] = tweets
        }
        send(null, value)
      })
    } catch(err) {
      send(err)
    }
  } else {
    send(new Error('Missing search term'))
  }
}
