//
// Scraper for Flick web site to pull information and output to console
//
var FlickAPI = require('flick-electric-api')
var request = require('request')
var config = require('config')

var flick = new FlickAPI(process.env.FLICK_EMAIL, process.env.FLICK_PWD);

require('console-stamp')(console, '[HH:MM:ss.l]')

console.log("Starting up...");

var request = request.defaults({jar: true})
var hass = config.get("hass")

var cost = 0

// attach some events
flick.on('error', function(err) { console.log("Error: " + err); });
flick.on('price', success);

// and get the current price
flick.get_price(); 

function success(price) {
  cost = (price * 1.15 * 100).toFixed(2)
  console.log("Cost: " + cost)
  if(!isNaN(cost)) {
    // publish to hass
    request.post({url:hass.url, json:{"state": cost, "attributes": {"unit_of_measurement": "c/kW"}}}, function(error, response, body) {
      if (error) { console.log(error) }
      console.log(cost + " sent to " + hass.url)
    })
  }
}
