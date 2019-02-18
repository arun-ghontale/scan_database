const mongoose = require('mongoose');


//---------------------====================NEED TO ADD LATEST TIME IN THE SCHEMA AS WELL.=================-----------------
const scanSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Resub_count: Number,
    Planet_name: String,
    First_time_sumbission: {type: Date},
    Latest_submission_time: {type: Date},
    Latest_active_time: {type: Date},
    Submission_type: String,
    Student_name: String,
    Link: String,
    Assignment_name: String,
    Student_id: String,
    Done_status: Number,
    turnAround: Number
},{
    timestamps: true
});

// Convention is uppercase for the model name
module.exports = mongoose.model('Scan',scanSchema);