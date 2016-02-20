var request = require('request')
var cheerio = require('cheerio')
module.exports = function (options, send) {
  var url = options.requiredProperties.url
  var threshold = options.requiredProperties.threshold

  request({
    'uri': url
  }, function (err, resp, body) {
    var $ = cheerio.load(body)
    var items = []
    $('.shop-listing').find('tr').each(function (index, item) {
      var tds = $(this).children()
      var b_p = ($(tds.eq(3)).find('a').text().trim())
      var s_p = ($(tds.eq(4)).find('a').text().trim())
      var temp = {
        shop: ($(tds.eq(0)).find('a').text().trim()),
        score: ($(tds.eq(1)).find('a').text().trim()),
        bare_price: parseInt(b_p.substring(0, b_p.indexOf(',')).replace('\u20ac', '').replace('.', '').trim()),
        shop_price: parseInt(s_p.substring(0, s_p.indexOf(',')).replace('\u20ac', '').replace('.', '').trim())
      }
      if (temp.shop !== '' && temp.bare_price && temp.shop_price)
        items.push(temp)
    })

    items = items.sort(function (a, b) { return a.shop_price - b.shop_price})
    var value = {
      observedState: items[0].shop_price - threshold > 0 ? 'Found' : 'NotFound',
      rawData: {
        items: items,
        best_item: items[0]
      }
    }
    // console.log(JSON.stringify(value))
    send(null, value)
  })
}
