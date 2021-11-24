const router = require("express").Router();
const pool = require("../../utilities/sqlConnection");
const fetch = require("node-fetch");
// const BASE_URL = "http://localhost:5000/api/";
const BASE_URL = "https://cleverchat.herokuapp.com/api/";
// returns a list of all the chats in the databaseUrl

/**
 * @api {get} api/chats Get all the chats the user is a part of 
 * @apiName GetChat
 * @apiGroup Chat
 */
router.get("/", (req, res, next) => {
    console.log("Get Request recieved!");
    /**
     * This will have passed a jwt check 
     */     
    //need to get all chats in the db that our user is a part of 
    //query all the chat id chatid numbs we are a member of 
    const query = `select chatid from ChatMembers where memberid = $1`;
    const values = [req.decoded.memberid];
    pool.query(query, values)
    .then(result => {
        console.log(result);
        res.locals.rows = result.rows;
        next();
        // res.status(200).send({message: "ok"});
    })
    .catch(err => {
        console.log(err);
        res.status(400).send({"error": err});
    })
}, (req, res, next) => {
    let ids = [];
    for(let i = 0; i < res.locals.rows.length; i++){
        ids.push(res.locals.rows[i].chatid);
    }
    console.log(ids);
    //here we have access to all the chat id that our user is a part of
    const query = "select * from chats where chatid = ANY($1::int[])";
    const values = [ids];
    pool.query(query, values)
    .then(result => {
        console.log(result.rows);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({chats:result.rows});
    })
    .catch(err  => {
        console.log(err);
        res.status(500).send({"Message": err})
    })

})


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
},(req, res, next) => {
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

            //TODO: Update this query to take a list of user id to add 
            //call the add user function for each user 
            // res.send({
            //     success: true,
            //     chatid: result.rows[0].chatid
            // });
            res.locals.chatid = result.rows[0].chatid;
            next();
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                message:"SQL Error",
                error:err
            })
        })
}, (req, res, next) => {
    console.log(req.body.members);
    //note we also need to add ourselves to the chat, this id can be found inside the jwt
    const data = {
        "chatid": res.locals.chatid, 
        "memberid": req.decoded.memberid
    };
    // console.log(req.headers.authorization);
    console.log(data.chatid + " is my id");
    //how we do things here will rely entierly on the Contacts */
    //TODO: Figure out why this is not working
    fetch(`${BASE_URL}chat/${res.locals.chatid}`, {
        method : "PUT",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json',
                "Authorization": req.headers.authorization
            },
        credentials: "same-origin"
    })
    .then(result => {
        console.log("result: " + result);
        //all good here
        console.log("Added self to chat!");
        next(); // this is to add all the rest of the members
    })
    .catch(err =>{
        console.log(err);
        console.log("could not add self to chat!");
        res.status(500).send({message: err});
    })
    /**
     * we need the users user id to pass to the next method
     * this should be being given to us from the front end i hope 
     * 
     */
 ;
}, (req, res) => {
    //TODO add contact members

    for(let i = 0; i < req.body.members.length; i++){
        const data = {
            "chatid": res.locals.chatid, 
            "memberid": req.body.members[i]
        };
        fetch(`${BASE_URL}chat/${res.locals.chatid}`, {
        method : "PUT",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json',
                "Authorization": req.headers.authorization
            },
        credentials: "same-origin"
        })
        .then(result => {
            console.log("result: " + result);
            //all good here
            console.log("Added self to chat!");
            // res.status(200).send({message:"Chat made successfully"});
            // next(); // this is to add all the rest of the members
        })
        .catch(err =>{
            console.log(err);
            console.log("could not add self to chat!");
            res.status(500).send({message: err});
        })
    }
    //if we made it here then we successfully added all people to chat
    res.status(200).send(
        {message:"Chat made successfully",
        chatid:res.locals.chatid}
        );

});


router.put("/:chatid", (req,res,next) => {
    //TODO section this off into its own method that does all this
    console.log("GOT THE PUT REQUESRT!");
    //check if the chatid is provided 
    //TODO add a fail response for missing jwt token
    if(!req.params.chatid){
        res.status(400).send({
            message: "Missing chatid"
        })
    } else if (isNaN(req.params.chatid)) {
        req.status(400).send({
            message:"Malformed Parameter, chatid must be a number"
        })
    }else {
        console.log("Made it to stage 1");
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
      let id = req.body.memberid;
    let values = [id];
   

    console.log("This is the user we are adding: " + id);

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
        let id = req.body.memberid;
        let values = [req.params.chatid, id];
        console.log("adding the user :"  + id);
    
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
    let id = req.body.memberid;
    let values = [req.params.chatid, id];
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

router.delete("/:id", (req, res, next) => {
    //check to see if the chat Exists
    const query = " select * from chats where chatid = $1";
    const values = [req.params.id];
    pool.query(query, values)
    .then(result => {
        if(result.rowCount > 0){
            //a chat with this id exists already
            next();
        } else {
            res.status(404).send({ message: "Chat does not exist"});
        }
    }) 
    .catch(err =>{
        console.log("281: " + err);
        res.status(500).json(err);
    })
}, (req, res, next) => {
    //clean up all the chat member stuff from the chat 
    const query = "delete from chatmembers where chatid = $1";
    const values = [req.params.id];
    pool.query(query, values)
    .then(result => {
        //removed all the chat members
        next();
    })
    .catch(err => {
        console.log("296: " + err);
        res.status(500).json(err);
    })
}, (req, res) => {
    //remove the actual chat    
    //TODO: add deletion of messages from the chat when the chat is deleted aswell
    const query = "delete from chats where chatid = $1";
    const values = [req.params.id];
    pool.query(query, values)
    .then(result => {
        res.status(200).send({ message:"Chat deleted successfully"});
    })
    .catch(err => {
        console.log("307: " + err);
        res.status(500).json(err);
    })
})
module.exports = router;