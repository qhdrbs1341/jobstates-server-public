const mongoose = require('mongoose');
const {Schema} = mongoose;
const {Types: {ObjectId}} = Schema;
const userSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User',userSchema,'user');
