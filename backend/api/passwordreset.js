const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");
const path = require('path');
const nodemailer = require('nodemailer');

//password validation
const isValidPassword= require('../../utilities/validationUtils').isValidPassword

const generateHash = require('../../utilities/credentialingUtils').generateHash
const generateSalt = require('../../utilities/credentialingUtils').generateSalt
/**
 * hit this endpoint with a post request
 * that request contains an email address addrerss
 * look up that email in the db and grab the emails verification code
 * then make a url to a get endpiont here that will push a password reset page up to
 * that page will then send a fetch request that tries to update the password
 * if successful then we say so
 * 
 * or we can send a code to the user, when the enter that code then we take them to the reset page
 */

//This will send an email to the user with the password reset link 
//also get name for email
router.post("/", (req, res) => {
    //get the users email which we will use to generate the link for reseting
    const userEmail = req.body.userEmail;
    console.log("the user email is "  + userEmail);
    //make email sender 
    const transporter = nodemailer.createTransport({
        service:"Gmail",
        auth: {
            user: process.env.VERIFICATION_EMAIL,
            pass: process.env.VERIFICATION_PASSWORD
        }
    })
    if(!transporter){
        res.status(500).json({message:"Internal server error"});
    }

 
    //
    const query = "SELECT verificationtoken,firstname FROM members  WHERE email = $1";
    const values = [userEmail];
    //make query
    pool.query(query, values)
    .then(result => {
        console.log(result.fields[0].value);
        console.log(result.rows[0].verificationtoken);
        const link = `https://cleverchat.herokuapp.com/api/passwordreset/${result.rows[0].verificationtoken}`
        const emailBody =`Hi ${result.rows[0].firstname}!\n Please click the link below to reset your password:\n${link}\n\nIf you did not request to reset your password please reset your password as someone may be trying to access your account`;
      
        //options for who we are sending it to
        const options = {
            from: process.env.VERIFICATION_EMAIL,
            to: userEmail,
            subject: "Reset Password",
            text:`${emailBody}`
    }
        //if query successful send email
        console.log(result.rows);
        transporter.sendMail(options, (err, response) => {
        if(err){
            console.log(err);
            res.status(500).json(err);
            return;
        }
        console.log("Sent:" + res.response);
        res.status(200).json({"message":"email sent"})
        })
    })
    .catch(err => {
        //log back error
        console.log(err);
        res.status(500).json(err);
    })
   
});

/**
 * 
 *This endpoint will open the webpage and somehow pass the unique id code into the website
 */
router.get("/:id", (req, res) => {
   //open the html page
   console.log("req recieved");
   res.status(200).redirect(`../../passwordReset.html?id=${req.params.id}`); 
})

router.post("/reset/:id", (req, res) => {
    console.log("Got it !");
    console.log(req.body);
    console.log(req.params.id);
    const password = req.body.newPassword;
     if(isValidPassword(password)) {
         //update to update the salt val in db
          // Generate salt then hash the password with the salt before storing in the database
        let salt = generateSalt(32)
        let saltedHashPassword = generateHash(password, salt);

        const query = "UPDATE members SET password = $1, salt =$2 WHERE verificationtoken = $3";
        const values = [saltedHashPassword,salt, req.params.id];

        //make query
        pool.query(query, values)
        .then(result => {
            console.log(result);
            res.status(200).json({"message":"Password updated successfully"})
        })
     }else {
         res.status(400).json({"message": "Invalid Password"})
     }
    
})
module.exports = router;