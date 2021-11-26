//handle requests
const router = require("express").Router();  
const { response } = require("express");
const pool = require("../../utilities/sqlConnection");
const { isStringProvided } = require("../../utilities/validationUtils");

 /**
 * @api {get} api/search/people Get all users from database
 * @apiName GetSearch
 * @apiGroup Search
 * 
 * @apiSuccess (Success) {Object} json "true" with all resulting rows of users from database
 * 
 * @apiError (400: No Users in Database) {String} message "No users here"
 * @apiError (400: SQL Error) {Object} json "SQL error" plus error details
 */ 
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

 /**
 * @api {post} api/search Search for a specific user
 * @apiName PostSearch
 * @apiGroup Search
 * 
 * @apiSuccess (Success) {Object} json "true" with the specific user info
 * 
 * @apiError (400: Missing Information) {String} message "Missing information"
 * @apiError (400: Can't Find User) {String} message "Can't find the user"
 * @apiError (400: SQL Error) {Object} json "SQL error" plus error details
 */ 
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
                search: request.body.search,
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