var request = require('request')
var cheerio = require('cheerio')
module.exports = function (options, send) {
  var url = 'http://www.wettelijke-feestdagen.be/'
  var currentDate = new Date()
  var isHoliday = false

  request({
    'uri': url
  }, function (err, resp, body) {
    var $ = cheerio.load(body)
    var dates = []
    $('td:contains(Nieuwjaar)').parents('table').find('tr').each(function (index, item) {
      if (index > 0) {
        var tds = $(item).find('td')
        var data = tds.eq(1).text().trim().replace('Mei', 'May')
        var dateFeest = {
          title: $(tds.eq(0)).find('a').text().trim(),
          data: data,
          date: new Date(data)
        }
        dates.push(dateFeest)
        var tmpFlag = currentDate.getDate() === dateFeest.date.getDate() &&
          currentDate.getMonth() === dateFeest.date.getMonth()
        isHoliday = isHoliday || tmpFlag
      }
    })
    console.log(JSON.stringify(dates))
    var value = {
      observedState: isHoliday ? 'TRUE' : 'FALSE',
      rawData: {
        dates: dates
      }
    }
    // console.log(JSON.stringify(value))
    send(null, value)
  })
}
