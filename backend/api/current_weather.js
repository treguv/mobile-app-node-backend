const API_KEY = process.env.WEATHER_API_KEY
const router = require("express").Router();
const request = require('request');


/**
 * @api {get} api/weather Get weather data
 * @apiName GetWeather
 * @apiGroup Weather

 * @apiSuccess (Success) {Object} json Weather data
 * 
 * @apiError (Error) {Object} error Description of error
 */ 
 router.get("/", (req, res) => {
    let zip_code = req.headers.zip;
    let lat = req.headers.latitude
    let lon = req.headers.longitude
    let url = "https://api.openweathermap.org/data/2.5/onecall?&units=imperial&lat="+ lat + "&lon=" + lon + "&exclude=minutely,alert,hourly&appid=" + API_KEY ;
    request(url, function (error, response, body) {
        if (error) {
            res.send(error)
        } else {
            // pass on everything (try out each of these in Postman to see the difference)
            // res.send(response);
            
            // or just pass on the body

            var n = body.indexOf("{")
            var nakidBody = body.substring(n - 1)
            res.send(nakidBody)
        }
    })
})

module.exports = router