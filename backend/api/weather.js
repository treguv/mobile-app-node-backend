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
    let lat = 47.25
    let lon = 122.44
    let zip_code = 98404
    let url = "https://api.openweathermap.org/data/2.5/weather?units=metric&zip="+ zip_code + ",us&appid=" + API_KEY;
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