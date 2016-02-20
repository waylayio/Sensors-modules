var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
module.exports = function (options, send) {
  var API_KEY = options.globalSettings.OPENWEATHER_KEY
  var city
  try {
    city = waylayUtil.getRawData(options, options.requiredProperties.city, 'city')
  } catch(err) {
    city = options.requiredProperties.city
  }

  var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric'
  if (API_KEY)
    url = url + '&APPID=' + API_KEY

  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        console.log(data)
        if (data.cod && data.cod != '200' && data.message)
          throw new Error(data.message)
        var state = data.weather[0].main
        var icon = data.weather[0].icon
        var temperature = data.main.temp

        var retState
        if (temperature > 32)
          retState = 'Heat'
        else if (temperature > 20)
          retState = 'Warm'
        else if (temperature > 12)
          retState = 'Mild'
        else if (temperature > 0)
          retState = 'Cold'
        else
          retState = 'Freezing'
        var value = {
          observedState: retState,
          rawData: {
            temperature: data.main.temp,
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            temp_min: data.main.temp_min,
            temp_max: data.main.temp_max,
            wind_speed: data.wind.speed,
            clouds_coverage: data.clouds.all,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            longitude: data.coord.lon,
            latitude: data.coord.lat,
            name: data.name,
            condition: state,
            icon: 'http://openweathermap.org/img/w/' + icon + '.png'
          }
        }
        // console.log(JSON.stringify(value))
        send(null, value)
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  } catch(error) {
    send(new Error(error))
  }

}
