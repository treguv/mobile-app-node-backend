//handle requests
const router = require("express").Router();  
const { response, request } = require("express");
const pool = require("../../utilities/sqlConnection");
const { isStringProvided, isValidEmail } = require("../../utilities/validationUtils");


/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {post} api/contact/list Get user contact list by email
 * @apiName PostListContact
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success) {Object} json User's email and contact list
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * @apiError (400: Missing Parameters) {String} message "This user don't have any contact"
 * 
 * @apiUse JSONError
 */ 
router.post("/list", (request, response, next) => {
    //Validate on empty parameters
    if(!isStringProvided(request.body.email)) {
        response.status(400).send({
            message: "Missing required information"
        })
    }
    else {
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
            response.locals.userMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 82",
            error: error
        })
    })
}, (request, response) => {
    let value = [response.locals.userMemberID.memberid]
    let query = "SELECT MemberID,Username, CONCAT(FirstName, ' ', LastName) AS Name FROM Members WHERE MemberID IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A=$1)";
    pool.query(query, value).then(result => {
        if(result.rowCount > 0) {
            response.send({
                email: request.body.email,
                rows: result.rows
            })
        }
        else {
            response.status(400).send({
                message: "This user don't have any contact"
            })
        }
    }).catch(err => {
        response.status(400).send({
            message: "SQL error 48",
            error: err
        })
    })
})

/**
 * @api {post} api/contact/add Add another user to contact list
 * @apiName PostAddContact
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success) {Object} json "true" and "successfully added this contact"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Cannot Add Yourself) {String} message "You can not add yourself :)"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * @apiError (404: Username Not Found) {String} message "Username not found"
 * @apiError (400: User Already Joined) {String} message "This user already joined contact list"
 * 
 * @apiUse JSONError
 */ 
router.post("/add", (request, response, next) => {
    //email of user A and username of user B
    //Validate on empty parameters
    if(!isStringProvided(request.body.email) 
        || !isStringProvided(request.body.username)) {
        response.status(400).send({
            message: "Missing required information"
        })
    }
    else {
        next()
    }
}, (request, response, next) => {
    //email and username not from the same person
    let value = [request.body.email, request.body.username]
    let query = "SELECT * FROM Members WHERE Email = $1 AND Username = $2"

    pool.query(query, value).then(result => {
        if(result.rowCount == 0) {
            next()
        }
        else {
            response.status(400).send({
                message: "You can not add yourself :)"
            })
        }
    })

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
            response.locals.userAMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 82",
            error: error
        })
    })
},(request, response, next) => {
    //Validate username
    let value = [request.body.username]
    let query = "SELECT MemberID FROM Members WHERE Username LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: "Username not found"
            })
        } else {
            response.locals.userBMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 102",
            error: error
        })
    })
}, (request, response, next) => {
    //Validate if user already exist in contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = `SELECT * FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2`
    pool.query(query, values).then(result => {
        if(result.rowCount > 0) {
            response.status(400).send({
                message: "This user already joined contact list"
            })
        }
        else {
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 124",
            error: error
        })
    })
}, (request, response, next) => {
    //add B to A's list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let insert = "INSERT INTO Contacts(MemberID_A, MemberID_B)"
                + "VALUES ($1, $2) RETURNING *"
    pool.query(insert, values)
        .then(result => {
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
}, (request, response) => {
    //add A to B's list 
    let values = [response.locals.userBMemberID.memberid, response.locals.userAMemberID.memberid]
    let insert = "INSERT INTO Contacts(MemberID_A, MemberID_B)"
                + "VALUES ($1, $2) RETURNING *"
    pool.query(insert, values)
        .then(result => {
            response.send({
                success: true,
                message: "successfully added this contact"
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
    })
});

/**
 * @api {post} api/contact/delete Delete a user out of contact list
 * @apiName PostDeleteContact
 * @apiGroup Contact
 * 
 * @apiHeader (Success) {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess {Object} json "true" and "successfully deleted this contact"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * @apiError (404: Username Not Found) {String} message "Username not found"
 * @apiError (400: User Not In Contact LIst) {String} message "This user is not in the contact list"
 * 
 * @apiUse JSONError
 */ 
 router.post("/delete", (request, response, next) => {
    //email of user A and username of user B
    //Validate on empty parameters
    if(!isStringProvided(request.body.email) 
        || !isStringProvided(request.body.username)) {
        response.status(400).send({
            message: "Missing required information"
        })
    }
    else {
        next()
    }
}, (request, response, next) => {
    //Validate email 
    let value = [request.body.email]
    let query = "SELECT * FROM Members WHERE Email LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: "Email not found"
            })
        } else {
            response.locals.userAMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 193",
            error: error
        })
    })
},(request, response, next) => {
    //Validate username
    let value = [request.body.username]
    let query = "SELECT * FROM Members WHERE Username LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: "Username not found"
            })
        } else {
            response.locals.userBMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 213",
            error: error
        })
    })
}, (request, response, next) => {
    //Validate if user exist in contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = "SELECT * FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2"
    pool.query(query, values).then(result => {
        if(result.rowCount > 0) {
            next()
        }
        else {
            response.status(400).send({
                message: "This user is not in the contact list"
            })
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error 232",
            error: error
        })
    })
}, (request, response) => {
    //Delete user out of contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = "DELETE FROM Contacts WHERE MemberID_A=$1 AND MemberID_B=$2 RETURNING *"
    pool.query(query, values)
        .then(result => {
            response.send({
                success: true,
                message: "Successfully deleted this contact."
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error 249",
                error: err
            })
        })
});


module.exports = router;
