const mongoose = require('mongoose');


//---------------------====================NEED TO ADD LATEST TIME IN THE SCHEMA AS WELL.=================-----------------
const sessionSchema = mongoose.Schema({
    _id: String,
    clients: {type: Number,default: 0, min:0}
},{
    timestamps: true
});

// Convention is uppercase for the model name
module.exports = mongoose.model('Session',sessionSchema);