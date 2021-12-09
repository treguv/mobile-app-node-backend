//handle requests
const router = require("express").Router();  
const { response, request } = require("express");
const pool = require("../../utilities/sqlConnection");
const { isStringProvided, isValidEmail } = require("../../utilities/validationUtils");
const msg_functions = require('../../utilities/exports').messaging

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
 * @apiError (400: Missing Parameters) {String} message "This user don't have any contact"
 * @apiError (400: SQL Error) {String} message "SQL error"
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
            message: "SQL Error",
            error: error
        })
    })
}, (request, response) => {
    let value = [response.locals.userMemberID.memberid]
    let query = "SELECT MemberID,Username, CONCAT(FirstName, ' ', LastName) AS Name FROM Members WHERE MemberID IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A=$1 AND Verified = 1)";
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
            message: "SQL error",
            error: err
        })
    })
})

//This endpoint return the contact tables of a user
router.post("/test", (request, response) => {
    let value = [request.body.id]
    let query = "SELECT * FROM Contacts WHERE MemberID_A = $1";
    pool.query(query, value).then(result => {
        if(result.rowCount > 0) {
            response.send({
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
            message: "SQL error",
            error: err
        })
    })
})

//This endpoint delete every contact tables of a user
router.post("/deleteContact", (request, response) => {
    let value = [request.body.id]
    let query = "DELETE FROM Contacts WHERE MemberID_A = $1";
    pool.query(query, value).then(result => {
        response.send({
            message: "Deleted!"
        })
    }).catch(err => {
        response.status(400).send({
            message: "SQL error",
            error: err
        })
    })
})

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {post} api/contact/requestList Get user contact request list by email
 * @apiName PostRequestListContact
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success) {Object} json User's email and contact request list
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (400: Missing Parameters) {String} message "This user don't have any friend request"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * 
 * @apiUse JSONError
 */ 
 router.post("/requestList", (request, response, next) => {
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
            message: "SQL Error",
            error: error
        })
    })
}, (request, response) => {
    let value = [response.locals.userMemberID.memberid]
    let query = "SELECT MemberID, Username, CONCAT(FirstName, ' ', LastName) AS Name FROM Members WHERE MemberID IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A=$1 AND Verified = 2)";
    pool.query(query, value).then(result => {
        if(result.rowCount > 0) {
            response.send({
                email: request.body.email,
                rows: result.rows
            })
        }
        else {
            response.status(400).send({
                message: "This user don't have any friend request"
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
 * @api {post} api/contact/sendRequest Send a friend request 
 * @apiName PostSendRequest
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success) {Object} json "true" and "successfully sent request"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Can not add self) {String} message "You can not add yourself :)"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (404: Already joined list) {String} message "This user already joined contact list"
 * @apiError (404: Already received) {String} message "You already received a request from this user"
 * @apiError (404: Already requested) {String} message "You already send a request to this user"
 * @apiError (404: Username Not Found) {String} message "Username not found"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * 
 * @apiUse JSONError
 */ 

router.post("/sendRequest", (request, response, next) => {
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
            message: "SQL Error",
            error: error
        })
    })
},(request, response, next) => {
    //Validate username and get memberID from this username
    let value = [request.body.username]
    let query = "SELECT MemberID FROM Members WHERE Username LIKE '%"+value+"%'"

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            console.log("Username not found...")
            response.status(404).send({
                message: "Username not found"
            })
        } else {
            response.locals.userBMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error",
            error: error
        })
    })
}, (request, response, next) => {
    //Validate if this user already exist in our contact list (1)  
    //or we already sent the request to them (0) 
    //or we already received a request from them (2)
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = `SELECT * FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2 AND (Verified = 1 OR Verified = 2 OR Verified = 0)`
    pool.query(query, values).then(result => {
        if(result.rowCount > 0) {
            if(result.rows[0].verified === 1) {
                response.status(400).send({
                    message: "This user already joined contact list"
                })
            }
            else if(result.rows[0].verified === 2) {
                response.status(400).send({
                    message: "You already received a request from this user"
                })
            }
            else if(result.rows[0].verified === 0) {
                response.status(400).send({
                    message: "You already send a request to this user"
                })
            }
        }
        else {
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error",
            error: error
        })
    })
}, (request, response, next) => {
    //insert 2 user in contact 
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let insert = "INSERT INTO Contacts(MemberID_A, MemberID_B)"
                + "VALUES ($1, $2) RETURNING *"
    pool.query(insert, values).then(result => {
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
}, (request, response, next) => {
    //add A to B's list 
    let values = [response.locals.userBMemberID.memberid, response.locals.userAMemberID.memberid]
    let insert = "INSERT INTO Contacts(MemberID_A, MemberID_B)"
                + "VALUES ($1, $2) RETURNING *"
    pool.query(insert, values).then(result => {
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
    })
}, (request, response) => {
    //Update verified number for the one who received the request (2)
    let values = [response.locals.userBMemberID.memberid, response.locals.userAMemberID.memberid]
    let update = "UPDATE Contacts SET Verified = 2 WHERE MemberID_A = $1 AND MemberID_B = $2"
    pool.query(update, values)
        .then(result => {
            // Success! send to pushytoken
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error with Inserting",
                error: err
            })
    })
}, (request, response) => {
    // send a notification of this message to ALL members with registered tokens
    let query = `SELECT token FROM Push_Token
                INNER JOIN Members ON
                Push_Token.memberid=Members.memberid
                WHERE Members.memberId=$1`
    let values = [response.locals.userBMemberID.memberid]
    console.log("MemberID_B=" + response.locals.userBMemberID.memberid)
    pool.query(query, values)
    .then(result => {
        console.log(result.rows)
        result.rows.forEach(entry => 
            msg_functions.sendContanctToIndividual(
                entry.token))
        console.log("Pushy token sent!")
        response.send({
            success: true,
            message: "successfully added this contact"
        })
    }).catch(err => {

        response.status(400).send({
            message: "SQL Error on select from push token",
            error: err
        })
    })
});

/**
 * @api {post} api/contact/responseRequest Response a friend request
 * @apiName PostResponseRequest
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success) {Object} json "true" and "successfully accepted/declined this contact"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information or answer is not valid (must be 1 or 0)"
 * @apiError (404: Email Not Found) {String} message "Email not found"
 * @apiError (400: SQL Error) {String} message "SQL error"
 * @apiError (404: Username Not Found) {String} message "Username not found"
 * @apiUse JSONError
 */ 

router.post("/responseRequest", (request, response, next) => {
    //email from the one who response the request
    //username from the one who sent the request
    //Answer is int, 1 for accept and 0 for decline
    //Validate on empty parameters
    if((request.body.answer === 1 || request.body.answer === 0)
        && isStringProvided(request.body.email)
        && isStringProvided(request.body.username)) {
        next()
    }
    else {
        response.status(400).send({
            message: "Missing required information or answer is not valid (must be 1 or 0)"
        })
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
            response.locals.userAMemberID = result.rows[0]
            next()
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error",
            error: error
        })
    })
},(request, response, next) => {
    //Validate username and get memberID from this username
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
            message: "SQL Error",
            error: error
        })
    })
}, (request, response, next) => {
    //For the user who received the request
    //If accept
    if(request.body.answer === 1) {
        let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
        //update verified number 
        let update = "UPDATE Contacts SET Verified = 1 WHERE MemberID_A = $1 AND MemberID_B = $2"
        pool.query(update, values).then(result => {
            next()
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
    }
    //If declined
    else {
        let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
        //delete 
        let query = "DELETE FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2"
        pool.query(query, values).then(result => {
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
    }  
}, (request, response) => {
    //For the user who sent the request
    //If accept
    if(request.body.answer === 1) {
        let values = [response.locals.userBMemberID.memberid, response.locals.userAMemberID.memberid]
        //update verified number 
        let update = "UPDATE Contacts SET Verified = 1 WHERE MemberID_A = $1 AND MemberID_B = $2"
        pool.query(update, values).then(result => {
            response.send({
                success: true,
                message: "Successfully accepted this contact."
            })
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
    }
    //If declined
    else {
        let values = [response.locals.userBMemberID.memberid, response.locals.userAMemberID.memberid]
        //delete 
        let query = "DELETE FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2"
        pool.query(query, values).then(result => {
            response.send({
                success: true,
                message: "Successfully rejected this contact."
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
    }  
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
            message: "SQL Error",
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
            message: "SQL Error",
            error: error
        })
    })
}, (request, response, next) => {
    //Validate if user exist in contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = "SELECT * FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2 AND Verified = 1"
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
            message: "SQL Error",
            error: error
        })
    })
}, (request, response, next) => {
    //Delete user out of contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = "DELETE FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2"
    pool.query(query, values).then(result => {
        next()
    }).catch(err => {
        response.status(400).send({
            message: "SQL Error",
            error: err
        })
    })
}, (request, response) => {
    //Delete user out of contact list
    let values = [response.locals.userAMemberID.memberid, response.locals.userBMemberID.memberid]
    let query = "DELETE FROM Contacts WHERE MemberID_A = $2 AND MemberID_B = $1"
    pool.query(query, values).then(result => {
        next()
        response.send({
            success: true,
            message: "Successfully deleted this contact."
        })
    }).catch(err => {
        response.status(400).send({
            message: "SQL Error",
            error: err
        })
    })
});

module.exports = router;

