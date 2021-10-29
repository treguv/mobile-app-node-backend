const router = require("express").Router();
 const pool = require("../../utilities/sqlConnection");
//idk how this works either
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
    const password = req.body.password; //add password hashing to this! TODO!
    const salt = "abcdefghijklmnopqrstuvwxyz"//make this actual salt!
    const verification = 0; // this will be updated in the actual verification part of it later

    //make sql query to register
    const query = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt,Verification) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING Email";
    const values = [firstName, lastName, username, email, password, salt, verification];
    //send the sql to the db"
    pool.query(query, values)
    .then(result => {
        // the user was added successfully
        // when we successfully made the request we need to make the call to the endpoint that will 
        // send the verification email
        fetch("http://localhost:5000/api/verification/", 
        {
            method:'post',
            body:JSON.stringify({
                userEmail: email
            }),
            headers: {'Content-Type': 'application/json'}
        })
        .then(result => {
            console.log("request sent");
        })
        .catch(err => {
            console.log(err);
        })
        //return the result to the user
        res.status(200).send({
            success:true,
            email:result.rows[0].email
        })
    }).catch((error) => {
        console.log(error)
        if (error.constraint == "members_username_key") {
            response.status(400).send({
                message: "Username exists"
            })
        } else if (error.constraint == "members_email_key") {
            response.status(400).send({
                message: "Email exists"
            })
        } else {
            response.status(400).send({
                message: "other error, see detail",
                detail: error.detail
            })
        }
    })
    //uncomment above
    // res.status(200).send("Post request sent to register endpoint");
})

router.put("/:id", (req, res) => {
    res.status(200).send("Put request sent to register endpoint");
})

router.delete("/:id", (req, res) => {
    res.status(200).send("Delete request sent to register endpoint");
})


module.exports = router;

