var waylayUtil = require('@waylay/sandbox-util')
var __ = require('lodash')
var request = require('request')
module.exports = function (options, send) {
  try {
    city = waylayUtil.getRawData(options, options.requiredProperties.city)
  } catch (err) {
    city = options.requiredProperties.city
    if (__.isEmpty(options.requiredProperties.city)) {
      send(new Error('Please enter value for city.'))
    }
  }

  // format URL
  var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + options.requiredProperties.city + '&units=metric'

  // use OPENWEATHER_KEY from properties or else global settings 
  var API_KEY
  if (!__.isEmpty(options.requiredProperties.openWeatherAPIKey)) {
    API_KEY = options.requiredProperties.openWeatherAPIKey
  } else if (!__.isEmpty(options.globalSettings.OPENWEATHER_KEY)) {
    API_KEY = options.globalSettings.OPENWEATHER_KEY
  } else {
    send(new Error('Please provide Open Weather Map API Key in the properties or global settings.'))
  }

  if (API_KEY)
    url = url + '&APPID=' + API_KEY

  var value
  try {
    request({
      uri: url
    }, function (err, response, body) {
      try {
        if (!err && response.statusCode == 200) {
          var data = JSON.parse(body)

          var state = 'Not Found'
          var list = data.list

          // if there are no 3h weather forecasts found, state remains as 'Not Found' 
          if (__.isEmpty(list)) {
            value = {
              observedState: state,
              rawData: data
            }
          } else {
            // if there are 3h weather forecasts found, find the ones with wet weather events
            var wetWeatherList = [], wetWeatherTypes = ['Rain', 'Drizzle', 'Thunderstorm', 'Snow']
            var humiditySum = 0, rainSum = 0
            for (var i = 0; i < list.length; i++) {
              var mainWeather = list[i].weather[0].main

              // put all the forecast with wet weather in a wetWeatherList
              if (__.contains(wetWeatherTypes, mainWeather)) {
                wetWeatherList.push(
                  {
                    timestampString: list[i].dt_txt,
                    weatherType: list[i].weather[0].main,
                    description: list[i].weather[0].description,
                    icon: list[i].weather[0].icon,
                    rain: list[i].rain,
                    humidity: list[i].main.humidity,
                    timestamp: list[i].dt * 1000 // timestamp in milliseconds
                  })
              }

              // if the wet weather has a rain property, sum up the rain volume
              if (!__.isEmpty(list[i].rain)) {
                rainSum += list[i].rain['3h']
              }
              // sum up the humidity of all 3h weather forecasts
              humiditySum += list[i].main.humidity
            }

            var avgHumidity, nextRain, nextRainVolume, daysTillNextRain
            state = 'None'

            if (wetWeatherList.length > 0) {
              avgHumidity = humiditySum / list.length

              // the first wetWeatherForecast is the latest (i.e. closest to the current datetime)
              nextRain = wetWeatherList[0]
              nextRainVolume = wetWeatherList[0].rain['3h']

              // calculate days to the next rain and therefore the state
              var nowDate = new Date()
              daysTillNextRain = (nextRain.timestamp - (nowDate.valueOf())) / 86400000 // one day is 86400000 milliseconds

              if (daysTillNextRain < 1) {
                state = 'Today'
              } else if (daysTillNextRain < 2) {
                state = 'Next Day'
              } else if (daysTillNextRain < 3) {
                state = '2 Days Later'
              } else if (daysTillNextRain < 4) {
                state = '3 Days Later'
              } else if (daysTillNextRain < 5) {
                state = '4 Days Later'
              }
            }

            value = {
              observedState: state,
              rawData: {
                cityId: data.city.id,
                cityName: data.city.name,
                cityCountry: data.city.country,
                totalRainVolume: rainSum,
                wetWeatherList: wetWeatherList,
                wetWeatherTypes: wetWeatherTypes,
                avgHumidity: avgHumidity,
                daysTillNextRain: daysTillNextRain,
                nextRainVolume: nextRainVolume
              }
            }
          }
          send(null, value)

        } else {
          send(new Error(err))
        }
      } catch (err) {
        send(new Error(err))

      }
    })
  } catch (err) {
    send(new Error(err))
  }
}
