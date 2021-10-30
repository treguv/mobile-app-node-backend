const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");

//account cred validation
const isStringProvided = require('../../utilities/validationUtils').isStringProvided
const isValidName = require('../../utilities/validationUtils').isValidName
const isValidUsername = require('../../utilities/validationUtils').isValidUsername
const isValidEmail= require('../../utilities/validationUtils').isValidEmail
const isValidPassword= require('../../utilities/validationUtils').isValidPassword

const generateHash = require('../../utilities/credentialingUtils').generateHash
const generateSalt = require('../../utilities/credentialingUtils').generateSalt

//fetch requests
 const fetch = require("node-fetch");
/**
 * this will handle the register routes
 */

router.get("/", (req, res) => {
    res.status(200).send("Get request sent to register endpoint");
})

//this endpoint will register the user
router.post("/", (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const verification = 0; // this will be updated in the actual verification part of it later


    //TODO: Make sure:
        // First and Last name are letters and hyphens only
        // Username is only letters, hypens, and underscores only
        // Email must have an @
        // Password must have a capital letter, a lowercase letter, a number, a special symbol, and is 7 or more characters long.
    if(isValidName(firstName) 
        && isValidName(lastName) 
        && isValidUsername(username) 
        && isValidEmail(email) 
        && isValidPassword(password)) {
        // If the fields of registration are properly formatted

        // Generate salt then hash the password with the salt before storing in the database
        let salt = generateSalt(32)
        let salted_hash_password = generateHash(password, salt)

        //make sql query to register
        const query = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt, Verification) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING Email";
        const values = [firstName, lastName, username, email, salted_hash_password, salt, verification];

        //send the sql to the db"
        pool.query(query, values)
        .then(result => {
            //send verification
            // when we successfully made the request we need to make the call to the endpoint that will 
        // send the verification email
        // no need to verify that we were given an email because it was verified in the step above
        fetch("http://localhost:5000/api/verification/", 
        {
            method:'post',
            body:JSON.stringify({
                userEmail: email,
                name:firstName,
            }),
            headers: {'Content-Type': 'application/json'}
        })
        .then(result => {
            console.log("request sent");
        })
        .catch(err => {
            console.log(err);
        })
            //Send the response back to the user
            res.status(200).send({
                success:true,
                email:result.rows[0].email
            })
        }).catch((error) => {
            console.log(error)
            if (error.constraint == "members_username_key") {
                // If username already exists on another account in DB
                res.status(400).send({
                    message: "Username exists"
                })
            } else if (error.constraint == "members_email_key") {
                // If email already exists on another account in DB
                res.status(400).send({
                    message: "Email exists"
                })
            } else { 
                // Other error, like SQL insertion method not inserting properly
                res.status(400).send({ 
                    // TODO: duplicate "message" is for testing
                    /*message: "FirstName: " + firstName 
                    + " LastName: " + lastName 
                    + " UserName: " + username 
                    + " Email: " + email 
                    + " Password: " + password 
                    + " Salt: " + salt 
                    + " SaltHashPassword: " + salted_hash_password 
                    + " Verification: " + verification,*/
                    message: "other error, see detail",
                    detail: error.detail
                })
            }
        })
    } else {
        // If fields are improperly formatted for registration from the start.
        res.status(400).send({
            message: "Missing required information"
        })
    }
    // res.status(200).send("Post request sent to register endpoint");
})

router.put("/:id", (req, res) => {
    res.status(200).send("Put request sent to register endpoint");
})

router.delete("/:id", (req, res) => {
    res.status(200).send("Delete request sent to register endpoint");
})


module.exports = router;

