const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");


//post route that will create the chat
router.post("/", (req, res, next) => {
    //check if it has all the needed information
    if(req.body.name == undefined){
        res.status(400).send( {
            mesage: "Missing required information"
        })
    } else {
        next();
    }
},(req, res) => {
    //sent it into the db to add it 
    const query = `INSERT INTO Chats(Name)
    VALUES ($1)
    RETURNING ChatId`;
    console.log(req.body.name);
    //verified that we have the name in prev step
    const values = [req.body.name];
    pool.query(query, values)
        .then(result =>{
            //cannot send number in res.send
            res.send({
                success: true,
                chatid: result.rows[0].chatid
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                message:"SQL Error",
                error:err
            })
        })
});

router.put("/:chatid", (req,res,next) => {
    //check if the chatid is provided 
    if(!req.params.chatid){
        res.status(400).send({
            message: "Missing chatid"
        })
    } else if (isNaN(req.params.chatid)) {
        req.status(400).send({
            message:"Malformed Parameter, chatid must be a number"
        })
    }else {
        next()
    }
}, (req, res, next) =>  {
    //validate that the chat id Exists
    let query = 'SELECT * FROM CHATS WHERE ChatId=$1'
    let values = [req.params.chatid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                res.status(404).send({
                    message: "Chat ID not found"
                })
            } else {
                next()
            }
        }).catch(error => {
            console.log("Sql error line 68")
            res.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
}, (req,res, next) => {
    //validate that the email exists in the db
     let query = 'SELECT * FROM Members WHERE MemberId=$1'
    let values = [req.decoded.memberid]

    console.log(req.decoded)

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                res.status(404).send({
                    message: "Email not found"
                })
            } else {
                //user found
                next()
            }
        }).catch(error => {
            console.log("sql error line 92")
            res.status(400).send({
                message: "SQL Error",
                error: error
            })
        })

}, (req,res, next) => {
    //make sure user has not already been added 
        let query = 'SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2'
        let values = [req.params.chatid, req.decoded.memberid]
    
        pool.query(query, values)
            .then(result => {
                if (result.rowCount > 0) {
                    res.status(400).send({
                        message: "user already joined"
                    })
                } else {
                    next()
                }
            }).catch(error => {
                console.log("Sql erro 114")
                res.status(400).send({
                    message: "SQL Error",
                    error: error
                })
            })
}, (req, res) => {
    //add the user to the chat
    let insert = `INSERT INTO ChatMembers(ChatId, MemberId)
    VALUES ($1, $2)
    RETURNING *`
    let values = [req.params.chatid, req.decoded.memberid]
    console.log(values);
    pool.query(insert, values)
        .then(result => {
            res.send({success: true})
        }).catch(err => {
            console.log("sql error 130")
            res.status(400).send({
            message: "SQL Error",
            error: err
        })
    })
})
module.exports = router;