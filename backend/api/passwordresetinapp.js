const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");
const path = require('path');
const nodemailer = require('nodemailer');

//password validation
const isValidPassword= require('../../utilities/validationUtils').isValidPassword

const generateHash = require('../../utilities/credentialingUtils').generateHash
const generateSalt = require('../../utilities/credentialingUtils').generateSalt;
const e = require("cors");

/**
 * @api {post} api/passwordresetinapp Allows user to reset their password while they are logged in
 * @apiName PostPasswordResetVerify
 * @apiGroup PasswordReset
 * 
 * @apiSuccess (Success 200) message "Password updated successfully"
 */
router.post("/",(req, res, next) => {
    if (req.body.password === req.body.newPassword) {
        res.status(400).json({message: "new password cannot match current password"})
    } else {
        // Current password and new password are different.
        next()
    }
},(req, res, next) => {
    if (isValidPassword(req.body.password)) {
        // Current password meets base password format requirements.
        next()
    } else {
        res.status(400).json({message: "'password' input doesn't meet base password "
        + "format requirements. " 
        + "Passwords must be 7-255 characters long and contain at least " 
        + "one capital letter, one lowercase letter, one number, and one of the " 
        + "special characters @#$%&*!?"})
    }
},(req, res, next) => {
    if (isValidPassword(req.body.newPassword)) {
        // New password meets base password format requirements.
        next()
    } else {
        res.status(400).json({message: "'newPassword' input doesn't meet base password "
        + "format requirements. " 
        + "Passwords must be 7-255 characters long and contain at least " 
        + "one capital letter, one lowercase letter, one number, and one of the " 
        + "special characters @#$%&*!?"})
    }
},(req, res, next) => {
    // Verify the current password matches the one the user wants to send
    console.log("In app reset recieved password")
    let query = "SELECT * FROM members WHERE email = $1";
    const values = [req.body.email];
    pool.query(query, values)
    .then(result => {
        console.log(result.rows);
        if (result.rowCount > 0) {
            const checkPassword = generateHash(req.body.password, result.rows[0].salt);
            if (result.rows[0].password === checkPassword) {
            //the user entered their password and we can reset the password
            next();
            } else {
                res.status(400).json({message: "'password' does not match current password"})
            }
        } else {
            res.status(404).json({ message:"User not found"})
        }
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({message: "SQL Error on retrieving user by email"})
    })
},(req, res) => {
    // console.log(req.body);
    // console.log(req.params.id);
    const newPassword = req.body.newPassword;

    //update to update the salt val in db
    // Generate salt then hash the password with the salt before storing in the 
    // database
    let salt = generateSalt(32)
    let saltedHashPassword = generateHash(newPassword, salt);

    const query = "UPDATE members SET password = $1, salt =$2 WHERE email = $3";
    const values = [saltedHashPassword,salt, req.body.email];

    //make query
    pool.query(query, values)
    .then(result => {
        console.log(result);
        res.status(200).json({message:"Password updated successfully"})
    }).catch(error => {
        console.log(error);
        res.status(400).json({message: "SQL Error when inserting new password"})
    }) 

})
module.exports = router;