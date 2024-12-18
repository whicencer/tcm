import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: Number,
    userName: String,
    request: {
        type: {
            channel: Number
        },
        required: false
    },
    messagesToDelete: {
        type: [Number],
        required: false
    },
    channels: {
        type: [{date: String, id: Number}]
    },
});

export const User = mongoose.model('User', UserSchema);