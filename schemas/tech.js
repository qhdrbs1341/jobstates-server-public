const mongoose = require('mongoose');
const {Schema} = mongoose;
const {Types: {ObjectId}} = Schema;
const techSchema = new Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    tech: {
        type: String
    },
    count: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Tech',techSchema,'tech');
