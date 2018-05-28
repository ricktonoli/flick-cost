//
// Scraper for Flick web site to pull information and output to console
//
var cheerio = require('cheerio')
var moment = require('moment')
var request = require('request')
var config = require('config')

require('console-stamp')(console, '[HH:MM:ss.l]')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

console.log("Starting up...");

var request = request.defaults({jar: true})

var hass = config.get("hass")

// Log in
request("https://id.flickelectric.co.nz/identity/users/sign_in", function (error, response, body) {

  $ = cheerio.load(body)

  console.log("Requested sign in page...")

  var authenticity_token = $('input[name="authenticity_token"]').val()

  request.post({url:"https://id.flickelectric.co.nz/identity/users/sign_in", form:{"authenticity_token": authenticity_token, "user[email]": process.env.FLICK_EMAIL, "user[password]": process.env.FLICK_PWD}}, function optionalCallback(err, httpResponse, body) {

  console.log("Posted to sign in page...")


  if (err) {
    return console.error('Failed:', err);
  }

  request("https://myflick.flickelectric.co.nz/dashboard/snapshot", function (error, response, body) {
      
      console.log("Loaded snapshot page...")
      
      $ = cheerio.load(body)


//      var flickMessage = $('.c-needle-commentary').html().replace('Your price right now is ', '').replace('.', '')

//      console.log(flickMessage)
      
      var cost = 0

//console.log(body)

      cost = parseFloat(body.substring(body.indexOf("value&quot;:&quot;")+18, body.indexOf("&quot;,&quot;unit_code")))
      cost = (cost * 1.15).toFixed(2)
      console.log("Cost: " + cost)
      if(!isNaN(cost)) {
        // publish to hass
        request.post({url:hass.url, json:{"state": cost, "attributes": {"unit_of_measurement": "c/kW"}}}, function(error, response, body) {
          if (error) { console.log(error) }
          console.log(cost + " sent to " + hass.url)
        })
      }
    })

  })
});
