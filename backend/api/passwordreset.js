const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");
const path = require('path');
const nodemailer = require('nodemailer');
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

    const emailBody =`Hi ${req.body.name}!\n Please click the link below to reset your password:\n\n\n If you did not request to reset your password please reset your password as someone may be trying to access your account`;

    //options for who we are sending it to
    const options = {
        from: process.env.VERIFICATION_EMAIL,
        to: userEmail,
        subject: "ResetPassword",
        text:`${emailBody}`
    }
    //
    const query = "SELECT FROM members  WHERE email = $1";
    const values = [userEmail];
    //make query
    pool.query(query, values)
    .then(result => {
        //if query successful send email
        console.log(result);
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

module.exports = router;