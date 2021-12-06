const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");

/**
 * @api {get} api/username Get a user's username from their email.
 * @apiName GetUsername
 * @apiGroup Username
 * 
 * @apiParam {String} email The email to search for the username
 * 
 * @apiSuccess {Object} username The user's username associated with the given email.
 * 
 * @apiError (400: Email not in Database) {String} message "Email does not exist in database"
 * @apiError (400: SQL Failed) {String} message "Username Retrieval SQL failed"
 */ 
router.get("/", (req, res) => {
    const email = req.body.email;

    const query = "SELECT Username FROM Members WHERE Email='" + email + "'"
    console.log(query)
    pool.query(query)
    .then(result => {
        console.log(result)
        if (result.rowCount < 1) {
            console.log("/username: Email does not exist in database")
            res.status(400).send({
                message: "Email does not exist in database"
            });
        } else {
            console.log("/username: Username found successfully!")
            res.status(200).send({
                username:result.rows[0].username
            });
        }
    }).catch(error => {
        console.log("/username: Username Retrieval SQL Failed")
        res.status(400).send({
            message: "Username Retrieval SQL Failed"
        });
    }) 
})

module.exports = router;

