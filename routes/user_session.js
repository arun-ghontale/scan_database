const userSession = require("../api/models/user_session");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

///-----------------ADD A ROUTE FOR HOW MANY ABOVE LAST 24 HOURS HAVE NOT BEEN EVALUATED-------------------------------

////changes///
///**************latest submission time is now latest active time, change the python code******************///
///**************check if a record is already present before adding it******************///

//login session
router.get("/connect", (req, res, next) => {
    console.log(typeof req.sessionID, "\n\n\n");
    //create the session info first
    const io = req.app.get('socketio');
    sessionObject = {
        _id: req.sessionID
    };

    //first check if the session info already exists

    userSession
        .findOne(sessionObject)
        .exec()
        .then(result => {
            console.log(result);

            //if session info doesn't exist then create a new session information
            if (!result) {
                console.log("New client connected");

                //If the document is not already present then create the document and save it in the database
                sessionObject.clients = 1;
                const sessionDoc = new userSession(sessionObject);

                sessionDoc
                    .save()
                    .then(result => {
                        console.log(result);
                        io.emit('callUsers', {})
                        res.status(201).json({
                            message: "Handling POST requests to /sessions/login",
                            createdSession: result
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        io.emit('callUsers', {})
                        res.status(500).json({
                            message: "Error while updating the session information for client " +
                                req.sessionID,
                            Error: err
                        });
                    });
            }

            // if the session information already exists then create the session information
            else {
                console.log("A client is already connected");

                newSessionDoc = result;
                newSessionDoc.clients += 1;

                userSession
                    .updateOne({
                        _id: newSessionDoc._id
                    }, {
                        $set: newSessionDoc
                    })
                    .exec()
                    .then(result => {
                        console.log(result);
                        io.emit('callUsers', {})
                        // //This fires a signal to all the clients to upate the particular record in the UI
                        // io.emit('updateDoc',{id:req.params.id,done_status:req.body.done_status,error:0})
                        res.status(200).json(result);
                    })
                    .catch(err => {
                        // console.log(err);
                        io.emit('callUsers', {})
                        //     //This fires an error message
                        //     io.emit('updateDoc',{id:req.params.id,done_status:req.body.done_status,error:1})
                        res.status(500).json({
                            error: err
                        });
                    });
                io.emit('callUsers', {})
                res.status(200).json({
                    message: "Trying to create an already existing object",
                    Error: "object already exists"
                });
            }
        })
        .catch(err => {
            // console.log(err);
            io.emit('callUsers', {})
            res.status(500).json({
                error: err
            });
        });
});

//login session
router.get("/disconnect", (req, res, next) => {
    //create the session info first
    sessionObject = {
        _id: req.sessionID
    };
    const io = req.app.get('socketio');

    userSession
        .updateOne({
            _id: sessionObject._id
        }, {
            $inc: {
                clients: -1
            }
        })
        .exec()
        .then(result => {
            console.log(result);

            // //This fires a signal to all the clients to upate the particular record in the UI
            // io.emit('updateDoc',{id:req.params.id,done_status:req.body.done_status,error:0})
            io.emit('callUsers', {})
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            io.emit('callUsers', {})
            //     //This fires an error message
            //     io.emit('updateDoc',{id:req.params.id,done_status:req.body.done_status,error:1})
            res.status(500).json({
                error: err
            });
        });
});

//get the number of unique users connected
router.get("/users", (req, res, next) => {

    //get the count of users with atleast 1 client open
    userSession.count({
            clients: {
                $gte: 1
            }
        })
        .exec()
        .then(count => {
            console.log(`Number of users ${count}`);

            // //This fires a signal to all the clients to upate the particular record in the UI
            // io.emit('updateDoc',{id:req.params.id,done_status:req.body.done_status,error:0})
            res.status(200).json({
                users: count
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

module.exports = router;