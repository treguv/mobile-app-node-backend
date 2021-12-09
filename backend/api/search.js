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
            message: "SQL error 33",
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
    response.locals.exist = {}
    //validate on empty parameters
    if (!isStringProvided(request.body.email) || !isStringProvided(request.body.search)) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else {
        //pass to search
        next()
    }
}, (request, response, next) => {
    //Validate email and get memberID from this email
    let value = [request.body.email]
    let query = "SELECT MemberID FROM Members WHERE Email LIKE '%"+value+"%'"
    
    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: "Email not found"
            })
        } else {
            response.locals.memberAid = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 76",
            error: error
        })
    })
}, (request, response, next) => {
    //Return MemberID from search
    let value = [request.body.search]
    let query = "SELECT MemberID FROM Members WHERE Username LIKE '%"+value+"%'"
    + "OR Email LIKE '%"+value+"%' OR CONCAT(FirstName, ' ', LastName) LIKE '%"+value+"%'"
    + "OR FirstName LIKE '%"+value+"%' OR LastName LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        //user found
        if(result.rowCount > 0) {
                //Save the result into local variable
                response.locals.searchResults = result.rows,
                next()
            }
        else {
            response.status(400).send({
                message: "Can't find this user"
            })
        }
    }).catch(err => {
        response.status(400).send({
            message: "SQL error 101",
            error: err
        })
    })
}, (request, response, next)  => {
    let value = [response.locals.memberAid.memberid]
    let query = "SELECT MemberID_B FROM Contacts WHERE MemberID_A = $1"
    pool.query(query, value).then(result => {
        //user found
        console.log(result.rowCount);
        console.log(result.rows);
        if(result.rowCount > 0) {
            response.locals.exist = result.rows;
            console.log("This user have these contacts")
            console.log(response.locals.exist);
            next()
        }
        else {
            console.log("This user don't have any contact")
            // response.locals.exist.memberid_b = 0;
            response.locals.exist = [];
            console.log("Going next")
            next()
        }
    }).catch(err => {
        console.log("ERROR!"  + err.message);
        response.status(400).send({
            message: "SQL error 121",
            error: err
        })
    })
}, (request, response) => {
    console.log(response.locals.exist);
    console.log("Made it into next!");
    let searchID = []
    response.locals.searchResults.forEach(memberId => {
        searchID.push(memberId.memberid);
    })
    let existID = []
    console.log("Exist: " + response.locals.exist);
    response.locals.exist.forEach(theId => {
        existID.push(theId.memberid_b)
    })
    console.log(searchID)
    console.log(existID)
    let values = [response.locals.memberAid.memberid, searchID, existID]
    let query = "SELECT Username, CONCAT(FirstName, ' ', LastName) AS Name FROM Members WHERE MemberID = ANY($2::int[]) AND MemberID != $1 AND NOT MemberID = ANY($3::int[])"

    pool.query(query, values).then(result => {
        //user found
        if(result.rowCount > 0) {
            console.log(result.rows);
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