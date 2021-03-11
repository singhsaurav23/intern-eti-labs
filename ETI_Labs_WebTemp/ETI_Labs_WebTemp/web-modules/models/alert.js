const mongoose = require('mongoose') ;

const alertSchema = new mongoose.Schema({
    
    facility: {
        type: String,
        required: true
    },
    machineCode: {
        type: Number,
        required: true
    },
    employeeCode: {
        type: Number,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const alertNew = mongoose.model('alertNew', alertSchema) ;

module.exports = alertNew ; 