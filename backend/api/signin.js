const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");
const isValidEmail= require('../../utilities/validationUtils').isValidEmail
const isValidPassword= require('../../utilities/validationUtils').isValidPassword
const isStringProvided= require('../../utilities/validationUtils').isStringProvided
const generateHash = require('../../utilities/credentialingUtils').generateHash
const jwt = require('jsonwebtoken')
const {v4:uuidv4} = require("uuid");
const nodemailer = require('nodemailer')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}

/**
 * this will handle the signin routes
 */

router.get("/", (req, res,next) => {
    if (isStringProvided(req.headers.authorization) && req.headers.authorization.startsWith('Basic ')) {
        next()
    } else {
        res.status(400).json({ message: 'Missing Authorization Header' })
    }
}, (req, res, next) => {
    // obtain auth credentials from HTTP Header
    const base64Credentials =  req.headers.authorization.split(' ')[1]
        
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')

    const [email, password] = credentials.split(':')

    if (isValidEmail(email) && isValidPassword(password)) {
        req.signin = { 
            "email" : email,
            "password" : password
        }
        next()
    } else {
        res.status(400).send({
            message: "Email or Password invalid!"
        })
    }
}, (req, res) => {
    const theQuery = "SELECT Password, Salt, MemberId FROM Members WHERE Email=$1"
    const values = [req.signin.email]
    const uniqueCode = uuidv4();
    pool.query(theQuery, values)
        .then(result => { 
            if (result.rowCount == 0) {
                res.status(404).send({
                    message: 'User not found' 
                })
                return
            }
            //Setup Url here 
            const emailBody =`Hi ${req.body.name}!\nPlease verify your account by clicking the link below: \nhttps://cleverchat.herokuapp.com//api/verification/${uniqueCode}\n\nThank you.`;
            //Retrieve the salt used to create the salted-hash provided from the DB
            let salt = result.rows[0].salt
            
            //Retrieve the salted-hash password provided from the DB
            let storedSaltedHash = result.rows[0].password 

            //Generate a hash based on the stored salt and the provided password
            let providedSaltedHash = generateHash(req.signin.password, salt)

            //Retrieve the verification from the DB
            let verification = result.rows[0].verification

            //Checking if the user already verificated their account 
            if(verification == 1){
                //Did our salted hash match their salted hash?
                if (storedSaltedHash === providedSaltedHash ) {
                    //credentials match. get a new JWT
                    let token = jwt.sign(
                        {
                            "email": req.signin.email,
                            "memberid": result.rows[0].memberid
                        },
                        config.secret,
                        { 
                            expiresIn: '100 days' // expires in 14 days
                        }
                    )
                    //package and send the results
                    res.json({
                        success: true,
                        message: 'Login successful!',
                        token: token
                    })
                } else {
                    //credentials dod not match
                    res.status(400).send({
                        message: 'Wrong Email or Password11!' 
                    })
                }
            } else {
                //Created auth mail
                let transport_email = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.VERIFICATION_EMAIL,
                        pass: process.env.VERIFICATION_PASSWORD
                    }
                });

                //Created mail option
                let mail_options = {
                    from: process.env.VERIFICATION_EMAIL,
                    to: req.body.userEmail,
                    subject: 'Verify your email',
                    text: `${emailBody}`
                };
                transport_email.sendMail(mail_options, (err, res) => {
                    if(err){
                        console.log(err);
                        res.status(500).json(err);
                        return;
                    }
                    console.log("Sent:" + res.response);
                })
                
            }
        })
        .catch((err) => {
            //log the error
            console.log(err.stack)
            res.status(400).send({
                message: err.detail
            })
        })
    })

router.post("/", (req, res) => {
    res.status(200).send("Post req sent to sign in  endpoint");
})

router.put("/:id", (req, res) => {
    res.status(200).send("Put req sent to sign inendpoint");
})

router.delete("/:id", (req, res) => {
    res.status(200).send("Delete req sent to sign in endpoint");
})


module.exports = router;


