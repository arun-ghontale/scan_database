const Scan = require('../api/models/scan');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const offsetHour = 5;
const offsetMinute = 30;
const slaThresholdmilliSeconds = 86400000; //24 hours in milliseconds

////changes///
///**************latest submission time is now latest active time, change the python code******************///
///**************check if a record is already present before adding it******************///

//POST to add a document to the DB
router.post('/', (req, res, next) => {

    const First_time_sumbission = new Date(req.body.first_time_sumbission)
    const Latest_submission_time = new Date(req.body.latest_submission_time)

    scanObj = {
        Resub_count: req.body.resub_count,
        Planet_name: req.body.planet_name,
        First_time_sumbission: First_time_sumbission,
        Latest_submission_time: Latest_submission_time,
        Submission_type: req.body.submission_type,
        Latest_active_time: req.body.latest_active_time,
        Student_name: req.body.student_name,
        Link: req.body.link,
        Assignment_name: req.body.assignment_name,
        Student_id: req.body.student_id,
        Done_status: req.body.done_status,
        turnAround: 0
    };
    Scan.findOne(scanObj)
        .exec()
        .then(result => {
            console.log(result)
            if (!result) {
                console.log("result not found");

                //If the document is not already present then create the document and save it in the database
                scanObj._id = new mongoose.Types.ObjectId()
                const scan = new Scan(scanObj);

                scan
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'Handling POST requests to /products',
                            createdProduct: result
                        });
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            message: 'Error while updating the database',
                            Error: err
                        });
                    });
            } else {
                console.log("result found")
                res.status(200).json({
                    message: 'Trying to create an already existing object',
                    Error: 'object already exists'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

});


//Expects a json of the following format to update a document
//1. First find if a document with that ID exists -> FindByID
//2. Calculate the turn around time and update the document -> updateOne
router.patch('/:id', (req, res, next) => {
    const io = req.app.get('socketio');
    //expects a single json object such as
    //{
    //    "done_status": 0
    //}
    console.log(req.body);
    const id = req.params.id;

    Scan.findById(id, function (err, document) {

        if (!err && document) {
            let newDoc = document;

            //==========----------NEEDS TO BE UPDATED TO INCLUDE THE LATEST ACTIVE TIME INSTEAD-------------=============
            //-----------------------------------------------------------------------------------------------------
            //updating the turn around time based on the latest evaluated time and the last comment/submission time
            const updatedAtTime = document.updatedAt;
            const LatestTime = document.Latest_active_time;
            //.getTime() gets unix times for a given Date() object
            const dif = updatedAtTime.getTime() - LatestTime.getTime();
            let SecondsBetweenTimes = dif / 1000;
            SecondsBetweenTimes = Math.abs(SecondsBetweenTimes);
            newDoc.turnAround = parseInt(SecondsBetweenTimes)
            console.log(newDoc.turnAround)
            //updating the turn around time based on the latest evaluated time and the last comment/submission time
            //-----------------------------------------------------------------------------------------------------

            //-----------------------------------------------------------------------------------------------------
            //updating the done status of a document
            newDoc.Done_status = req.body.done_status;
            //-----------------------------------------------------------------------------------------------------
            //updating the done status of a document


            Scan.updateOne({
                    _id: document._id
                }, {
                    $set: newDoc
                })
                .exec()
                .then(result => {
                    console.log(result);

                    //This fires a signal to all the clients to upate the particular record in the UI
                    io.emit('updateDoc', {
                        id: req.params.id,
                        done_status: req.body.done_status,
                        error: 0
                    })
                    res.status(200).json(result);
                })
                .catch(err => {
                    console.log(err);

                    //This fires an error message
                    io.emit('updateDoc', {
                        id: req.params.id,
                        done_status: req.body.done_status,
                        error: 1
                    })
                    res.status(500).json({
                        error: err
                    })
                })

        } else {
            res.status(404).json({
                error: err
            })
        }
    });

});

//fetches all submissions on a particular date given a JSON of the below format
router.post('/submissions', (req, res, next) => {

    //expects a single json object such as
    //{
    //    "start_year":2018,
    //    "start_month":11,//11 would mean december
    //    "start_day":25,
    //    "end_year":2018,
    //    "end_month":11,
    //    "end_day":25,
    //}
    console.log(req.body)

    //month starts from 0
    const startDate = new Date(parseInt(req.body.start_year), parseInt(req.body.start_month), parseInt(req.body.start_day), 00 + offsetHour, 00 + offsetMinute, 00)
    const endDate = new Date(parseInt(req.body.end_year), parseInt(req.body.end_month), parseInt(req.body.end_day), 23 + offsetHour, 59 + offsetMinute, 59)

    console.log(startDate, endDate)
    Scan.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .exec()
        .then(results => {
            console.log(results.length)

            //sort based on latest submission time-> needs to be updated to latest active time
            results.sort(function (a, b) {
                var dateA = new Date(a.Latest_active_time),
                    dateB = new Date(b.Latest_active_time)
                return dateA - dateB //sort by date ascending
            })

            //get the assignment distribution
            assignmentDistribution = new Object()
            results.map((each) => {
                if (!(each.Assignment_name in assignmentDistribution)) {
                    if (each.Done_status == 1) {
                        assignmentDistribution[each.Assignment_name] = {
                            completed: 1,
                            notCompleted: 0
                        }
                    } else {
                        assignmentDistribution[each.Assignment_name] = {
                            completed: 0,
                            notCompleted: 1
                        }
                    }
                } else {
                    if (each.Done_status == 1) {
                        assignmentDistribution[each.Assignment_name]['completed'] += 1
                    } else {
                        assignmentDistribution[each.Assignment_name]['notCompleted'] += 1
                    }
                }

            })

            res.status(200).json({
                assignmentDistribution: assignmentDistribution,
                assignments: results
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})


//routes for not dones greater than 24 hours 
router.get('/notdone', (req, res, next) => {

    let currentTime = new Date();
    let localOffset = currentTime.getTimezoneOffset() * 60000;

    //current IST time
    let currentTimeOffset = new Date(currentTime - localOffset);

    console.log('current Time', currentTimeOffset)
    Scan.find({
            Done_status: 0
        })
        .exec()
        .then(results => {
            console.log("number of records not evaluated", results.length)
            const finalResults = results.filter((result) => {
                evaluationTimeExceed = (currentTimeOffset - result.Latest_active_time) > slaThresholdmilliSeconds;
                return evaluationTimeExceed ? true : false
            })
            console.log("Number of records not evaluated and crossed more than 24 hours", finalResults.length)
            res.status(200).json(finalResults);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;