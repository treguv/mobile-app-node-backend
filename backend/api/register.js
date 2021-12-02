const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");

//account cred validation
const isValidName = require('../../utilities/validationUtils').isValidName
const isValidUsername = require('../../utilities/validationUtils').isValidUsername
const isValidEmail= require('../../utilities/validationUtils').isValidEmail
const isValidPassword= require('../../utilities/validationUtils').isValidPassword

const generateHash = require('../../utilities/credentialingUtils').generateHash
const generateSalt = require('../../utilities/credentialingUtils').generateSalt

//fetch requests
 const fetch = require("node-fetch");
/*
 * this will handle the register routes
 */

/* 
router.get("/", (req, res) => {
    res.status(200).send("Get request sent to register endpoint");
}) 
*/

/**
 * @api {post} api/register Register a new account for the user.
 * @apiName PostRegister
 * @apiGroup Register
 * 
 * @apiParam {String} firstName User's first name
 * @apiParam {String} lastName User's last name
 * @apiParam {String} username User's unique screen name
 * @apiParam {String} email User's email for the new account
 * @apiParam {String} password User's password for the new account
 * 
 * @apiSuccess {Boolean} success True if the user's registration information was 
 *  successfully inserted into the database.
 * @apiSuccess {Object} email The email address of the user.
 * 
 * @apiError (400: Email Exists in DB) {String} message "Email exists"
 * @apiError (400: Input Valid but Failed DB Insert) {String} message "Input valid, but 
 *  failed to insert into database"
 * @apiError (400: Invalid Input) {String} message "Fields empty or improperly formatted"
 * @apiError (400: Invalid Input) {String} message "First and last names must be 2-255 
 *  characters long and only contain letters, spaces, or hyphens"
 * @apiError (400: Invalid Input) {String} message "Emails must be 3-255 characters long,
 *  must contain an "@" sign, and only contain letters, numbers, hyphens, underscores, or
 *  periods"
 * @apiError (400: Invalid Input) {String} message "Passwords must be 7-255 characters 
 *  long and contain at least one capital letter, one lowercase letter, one number, and 
 *  one of the special characters @#$%&*!?"
 */ 
router.post("/", (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const verification = 0; // 0 = unverified, 1 = verified

    // If the fields of registration are properly formatted
    if(isValidName(firstName) 
        && isValidName(lastName)
        && isValidUsername(username)
        && isValidEmail(email) 
        && isValidPassword(password)) {

        // Generate salt, then hash the password with the salt before storing in the 
        // database
        let salt = generateSalt(32)
        let salted_hash_password = generateHash(password, salt)

        // Make sql query to register (username defaults to email)
        const query = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, " 
            + "Password, Salt, Verification) VALUES ($1, $2, $3, $4, $5, $6, $7) " 
            + "RETURNING Email";
        const values = [firstName, lastName, username, email, salted_hash_password, salt, 
            verification];

        // Send the sql to the database
        pool.query(query, values)
        .then(result => {
            //send verification
            // when we successfully made the request we need to make the call to the 
        // endpoint that will send the verification email
        // no need to verify that we were given an email because it was verified 
        // in the step above
        fetch("https://cleverchat.herokuapp.com/api/verification/", 
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
        }).catch(error => { 
            console.log(error)
            // If email already exists on another account in the database
            if (error.constraint == "members_username_key") {
                res.status(400).send({
                    message: "Username exists"
                })
            } else if (error.constraint == "members_email_key") {
                res.status(400).send({
                    message: "Email exists"
                })
            } else {    // Other error, like SQL insertion method not inserting properly 
                        // into database
                res.status(400).send({ 
                    message: "Input valid, but failed to insert into database",
                    detail: error.detail
                })
            }
        })
    } else {
        // If fields of registration are improperly formatted
        let errorMessage = "Fields empty or improperly formatted"
        if (!isValidName(firstName) || !(isValidName(lastName))) {
            errorMessage = "First and last names must be 2-255 characters long and only "
            + "contain letters, spaces, or hyphens"
        } else if (!isValidUsername(username)) {
            errorMessage = "Usernames must be 2-24 characters long and only contain " 
            + "letters, numbers, hyphens, or underscores"
        } else if (!isValidEmail(email)) {
            errorMessage = "Emails must be 3-255 characters long, must contain an \"@\"" 
            + "sign, and only contain letters, numbers, hyphens, underscores, or periods"
        } else if (!isValidPassword(password)) {
            errorMessage = "Passwords must be 7-255 characters long and contain at least " 
            + "one capital letter, one lowercase letter, one number, and one of the " 
            + "special characters @#$%&*!?"
        }        
        
        res.status(400).send({
            message: errorMessage
        })
    }
})

/* 
router.put("/:id", (req, res) => {
    res.status(200).send("Put request sent to register endpoint");
})

router.delete("/:id", (req, res) => {
    res.status(200).send("Delete request sent to register endpoint");
}) 
*/

module.exports = router;

