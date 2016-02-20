var request = require('request')
module.exports = function (options, send) {
  var API_KEY = options.globalSettings.OPENWEATHER_KEY

  var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + options.requiredProperties.city + '&units=metric'
  if (API_KEY)
    url = url + '&APPID=' + API_KEY

  var currenTime = new Date() / 1000 // to get UTC in seconds

  request({
    'uri': url
  }, function (err, resp, body) {
    var data = JSON.parse(body)
    var state = data.weather[0].main
    var icon = data.weather[0].icon
    var sunrise = data.sys.sunrise
    var sunset = data.sys.sunset
    var retState = 'Dark'
    var timeToLightHours = -1
    var timeToDarkHours = -1
    var dayLightHours = (sunset - sunrise) / 60 / 60 // in hours

    if (currenTime < sunrise && currenTime < sunset) {
      retState = 'Dark'
      timeToLightHours = (sunrise - currenTime) / 60 / 60 // in hours
    } else if (currenTime > sunrise && currenTime < sunset) {
      retState = 'Light'
      timeToDarkHours = (sunset - currenTime) / 60 / 60 // in hours
    } else if (currenTime > sunrise && currenTime > sunset) { // you are just end of a day, 
      retState = 'Dark'
      // we assume that tomorrow sunset is exactly the same time as today, not accurate
      timeToDarkHours = ((sunrise + 24 * 60 * 60) - currenTime) / 60 / 60 // in hours
    }
    console.log('dayLightHours:' + dayLightHours)
    console.log('timeToLightHours:' + timeToLightHours)
    console.log('timeToDarkHours:' + timeToDarkHours)

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
        currenTime: currenTime * 1000,
        timeToDarkHours: timeToDarkHours,
        timeToLightHours: timeToLightHours,
        dayLightHours: dayLightHours,
        longitude: data.coord.lon,
        latitude: data.coord.lat,
        name: data.name,
        condition: state,
        icon: 'http://openweathermap.org/img/w/' + icon + '.png'
      }
    }
    // console.log(JSON.stringify(value))
    send(null, value)
  })
}
