var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  // Jenkins api documentation:
  // https://wiki.jenkins-ci.org/display/JENKINS/Remote+access+API
  //
  // Icon: http://jenkins-ci.org/sites/default/files/images/headshot.png
  //
  // States: BLUE / YELLOW / RED
  // Properties:
  //  * baseUrl (eg https://ci.yourcompany.com)
  //  * username
  //  * token
  //
  // get the api token from your http://[host]/user/[login]/configure

  var props = options.requiredProperties

  if (props.baseUrl !== undefined && props.token !== undefined && props.username !== undefined) {
    var baseUrl = props.baseUrl
    var username = props.username
    var token = props.token
    var options = {
      'url': baseUrl + '/api/json',
      'auth': {
        'user': username,
        'pass': token,
        'sendImmediately': true
      }
    }

    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body)
        var colors = __.map(json.jobs, function (job) {
          return job.color
        })
        var state = 'BLUE'
        if (colors.indexOf('red') >= 0) {
          state = 'RED'
        }else if (colors.indexOf('yellow') >= 0) {
          state = 'YELLOW'
        }
        var value = {
          observedState: state,
          rawData: json
        }
        send(null, value)
      } else {
        send(new Error(error + ' ' + body))
      }
    }
    request(options, callback)
  } else {
    send(new Error('Missing properties'))
  }
}
