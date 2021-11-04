const router = require('express').Router()
require('dotenv').config();
const nodemailer = require('nodemailer');
const {v4:uuidv4} = require("uuid");
const pool = require("../../utilities/sqlConnection");
// const verificationPage = require("../../pages/verification/index.html");

/**
 * @api {post} api/verification Post request that sends the verification email
 * @apiName PostVerification
 * @apiGroup Verification
 * 
 * @apiParam {String} name User's first name
 * @apiParam {String} userEmail User's email
 * 
 * @apiSuccess {String} sent "Sent:" + res.response
 * 
 * @apiError (500: Internal Server Error) {String} message "Internal Server Error"
 * @apiError (500: Internal Server Error) {Object} err Error detail
 */ 
router.post("/", (req, res) => {
    //make transporter ( sender)
    const uniqueCode = uuidv4();
    console.log("sending email to" + req.body.userEmail);
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

    const emailBody =`Hi ${req.body.name}!\nPlease verify your account by clicking the link below: \nhttps://cleverchat.herokuapp.com/api/verification/${uniqueCode}\n\nThank you.`;
    //options for who we are sending it to
    // console.log(process.env.VERIFICATION_EMAIL,process.env.VERIFICATION_PASSWORD);
    const options = {
        from: process.env.VERIFICATION_EMAIL,
        to: req.body.userEmail,
        subject: "Account Verification",
        text:`${emailBody}`
    }
    transporter.sendMail(options, (err, res) => {
        if(err){
            console.log(err);
            res.status(500).json(err);
            return;
        }
        console.log("Sent:" + res.response);

    })

    //add the verification token to the database
    const query = "UPDATE members SET verificationtoken = $1 WHERE lower(email) = lower($2)";
    const values = [uniqueCode, req.body.userEmail];
    pool.query(query, values)
    .then(result => {
        //just send back a 200 code
        console.log("i think it worked?");
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json(err);
    })
})

/**
 * @api {get} api/verification/:code This endpoint is used for the verification link
 * @apiName GetVerification
 * @apiGroup Verification
 * 
 * @apiParam {String} code Special code that, if matched with the DB code, allows the 
 *  user to be verified.
 * 
 * @apiSuccess (Success 200 Redirected) redirectedUrlString
 * 
 * @apiError (500: Internal Server Error) {Object} err Error detail
 */ 
router.get("/:code", (req, res) => {
    console.log(req.params.code);
    //here we need to check if the db contains that code
    //and activate the account
    //for that we need to det up the account
    const query = "UPDATE members SET verification = 1 where verificationtoken = $1";
    const values = [req.params.code];
    pool.query(query, values)
    .then(response => {
        //make a simple html page to send back here 
        res.status(200).redirect("../../verification.html")
    })
    .catch(err => {
        res.status(500).json(err);
    })
})
module.exports = router