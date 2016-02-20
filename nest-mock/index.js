module.exports = function (options, send) {
  /*Check the documentation and how to get an API key, After this, you need to invoke a REST call and pass the
object in the callback (in this example device)
API reference: https://developer.nest.com/documentation/api-reference

request({
        "uri": url
    }, function(err, resp, body){
        var data = JSON.parse(body)
        ...YOUR FUNCITON GOES here, see below the example
       send(null, value)
        
    })
*/

  // this is example response from NEST documentation, you need to replace it with your device
  var device = {
    'device_id': 'peyiJNo0IldT2YlIVtYaGQ',
    'locale': 'en-US',
    'software_version': '4.0',
    'structure_id': 'VqFabWH21nwVyd4RWgJgNb292wa7hG_dUwo2i2SG7j3-BOLY0BA4sw',
    'name': 'Hallway (upstairs)',
    'name_long': 'Hallway Thermostat (upstairs)',
    'last_connection': '2014-03-02T23:20:19+00:00',
    'is_online': true,
    'can_cool': true,
    'can_heat': true,
    'is_using_emergency_heat': true,
    'has_fan': true,
    'fan_timer_active': true,
    'fan_timer_timeout': '2014-03-02T23:20:19+00:00',
    'has_leaf': true,
    'temperature_scale': 'C',
    'target_temperature_f': 72,
    'target_temperature_c': 21.5,
    'target_temperature_high_f': 72,
    'target_temperature_high_c': 21.5,
    'target_temperature_low_f': 64,
    'target_temperature_low_c': 17.5,
    'away_temperature_high_f': 72,
    'away_temperature_high_c': 21.5,
    'away_temperature_low_f': 64,
    'away_temperature_low_c': 17.5,
    'hvac_mode': 'heat',
    'ambient_temperature_f': 72,
    'ambient_temperature_c': 21.5
  }

  // NOTE: I am adding random data here, to change slightly the temperature
  var randomValue = Math.random()
  var range = parseInt(options.requiredProperties.range) || device.target_temperature_high_c - device.target_temperature_low_c
  var thr = parseInt(options.requiredProperties.threshold) || (device.target_temperature_high_c + device.target_temperature_low_c) / 2
  var valueToTest = device[options.requiredProperties.parameter] || device.ambient_temperature_c
  // this is for OUR widget
  device.temperature = device.ambient_temperature_c
  // add some dynamic changes...
  valueToTest += randomValue
  if (valueToTest) {
    console.log('device value is ' + valueToTest)
    // default range is 3 degrees
    console.log('threshold: ' + thr)
    console.log('range: ' + range)
    var state = 'Lower'
    if (valueToTest > thr + range)
      state = 'Higher'
    else if (valueToTest > thr && valueToTest < thr + range)
      state = 'inRange'
    var value = {
      observedState: state,
      rawData: device
    }
    send(null, value)
  } else {
    send(new Error('Missing value on device for' + options.requiredProperties.parameter))
  }

}
