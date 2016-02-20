var waylayUtil = require('@waylay/sandbox-util')
var request = require('request')
var __ = require('lodash')
module.exports = function (options, send) {
  // array of parkings that are full from the previous check
  var cacheFullParkings = waylayUtil.getCacheData(options, 'fullParkings') || []
  var cacheLowCapacityParkings = waylayUtil.getCacheData(options, 'lowCapacityParkings') || []

  var url = 'http://datatank.stad.gent/4/mobiliteit/bezettingparkeergaragesv11.json'
  var recommendations = []
  var fullParkings, listAvailiableParkings, listLowCapacityParkings, listFullParkings, listRemainFullParkings, listBackToAvailableParkings

  try {
    request({
      'uri': url
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var data = JSON.parse(body)
        console.log(data)
        processData(data)
      } else {
        console.log(response)
        send(new Error(response.statusCode))
      }
    })
  } catch(err) {
    send(new Error('failed for fetching ' + url))
  }

  var filterParking = function (parking) {
    var flag = (__.contains(listAvailiableParkings, parking) && (!__.contains(cacheFullParkings, parking) && !__.contains(cacheLowCapacityParkings, parking))) ||
      (__.contains(listAvailiableParkings, parking) && (__.contains(cacheFullParkings, parking) || __.contains(cacheLowCapacityParkings, parking)) &&
      !__.contains(listLowCapacityParkings, parking))
    console.log('checking for ' + parking + ' is ' + flag)
    return flag

  }

  // this is really not clear to me,..
  var isParkingOpen = function (parking) {
    // return (!parking.full && parking.open && parking.availableCapacity !="VOL" )
    return (parking.availableCapacity != 'VOL' && parking.availableCapacity > 0)
  }

  var processData = function (data) {
    var parkings = data.Parkings.parkings
    parkings = __.map(parkings, function (p) {
      p.availCapPercentage = parseFloat(p.availableCapacity) / parseFloat(p.totalCapacity)
      return p
    })
    var availableParkings = __.filter(parkings, function (parking) {
      return isParkingOpen(parking)
    })

    fullParkings = __.filter(parkings, function (parking) {return !isParkingOpen(parking);})

    listAvailiableParkings = __.map(availableParkings, function (p) {return p.description})
    listLowCapacityParkings = __.compact(__.map(availableParkings, function (p) {if (p.availCapPercentage < 0.15) return p.description}))
    listFullParkings = __.map(fullParkings, function (p) {return p.description})
    listRemainFullParkings = __.compact(__.map(listFullParkings, function (p) {
      if (__.contains(cacheFullParkings, p.description)) return p.description}))
    listBackToAvailableParkings = __.union(__.compact(__.map(availableParkings, function (p) {
      if (p.availCapPercentage > 0.15 && __.contains(cacheFullParkings, p.description)) return p.description})),
      __.compact(__.map(availableParkings, function (p) {
        if (p.availCapPercentage > 0.15 && __.contains(cacheLowCapacityParkings, p.description)) return p.description}))
    )
    listAlterntativeToAvailableParkings = __.union(listBackToAvailableParkings,
      __.compact(__.map(availableParkings, function (p) {
        if (p.availCapPercentage > 0.15 && !__.contains(cacheLowCapacityParkings, p.description) &&
          !__.contains(cacheFullParkings, p.description)) return p.description}))
    )

    var state = 'OK'
    if (fullParkings.length > 0 && fullParkings.length < 3)
      state = 'MEDIUM'
    else if (fullParkings.length > 2)
      state = 'CRITICAL'
    var rawData = {
      fullParkings: listFullParkings,
      availableParkings: listAvailiableParkings,
      lowCapacityParkings: listLowCapacityParkings,
      backToAvailableParkings: listBackToAvailableParkings,
      remainFullParkings: listRemainFullParkings,
      alterntativeAvailableParkings: listAlterntativeToAvailableParkings,
      parkings: parkings
    }
    var value = {
      observedState: state,
      rawData: rawData
    }
    send(null, value)
  }

}
