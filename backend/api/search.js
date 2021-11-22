//handle requests
const router = require("express").Router();  
const { response } = require("express");
const pool = require("../../utilities/sqlConnection");
const { isStringProvided } = require("../../utilities/validationUtils");

 /* @apiError (400: No user exists) {String} message "No user here"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} SQL error
 * 
 * @apiError (400: No user found) {String} message "Can't find this user"
 */

// Get all the users from database
router.get("/people", (request, response) => {
    let query = "SELECT * FROM Members";
    pool.query(query).then(result => {
        if(result.rowCount > 0) {
            response.send({
                success: true,
                rows: result.rows
            })
        }
        else {
            response.status(400).send({
                message: "No user here"
            })
        }
    }).catch(err => {
        response.status(400).send({
            message: "SQL error",
            error: err
        })
    })
})

// Search for user
router.post("/", (request, response, next) => {
    //validate on empty parameters
    if (request.body.search === undefined || !isStringProvided(request.body.search)) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else {
        //pass to search
        next()
    }
}, (request, response) => {
    let value = [request.body.search]
    let query = "SELECT Username, CONCAT(FirstName, ' ', LastName) AS Name FROM Members WHERE Username LIKE '%"+value+"%'"
    + "OR Email LIKE '%"+value+"%' OR CONCAT(FirstName, ' ', LastName) LIKE '%"+value+"%'"
    + "OR FirstName LIKE '%"+value+"%' OR LastName LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        //if user exist
        if(result.rowCount > 0) {
            response.send({
                success: true,
                user: result.rows
            })
        }
        else {
            response.status(400).send({
                message: "Can't find this user"
            })
        }
    }).catch(err => {
        response.status(400).send({
            message: "SQL error",
            error: err
        })
    })
})

module.exports = router;