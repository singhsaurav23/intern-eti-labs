const mongoose = require('mongoose') ;

const machineSchema = new mongoose.Schema({
    
    facility: {
        type: String,
        required: true
    },
    machineCode: {
        type: Number,
        required: true
    },
    machineName: {
        type: String,
        required: true
    },
    hydraulicMotors: {
        type: Number,
        required: true
    },
    coolant: {
        type: Number,
        required: true
    },
    lubricationMotors: { 
        type: Number, 
        required: true
    }
});

const machineNew = mongoose.model('machineNew', machineSchema) ;

module.exports = machineNew ; 