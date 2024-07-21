import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    _id: Number,
    inputMode: {
        type: Boolean,
        required: false
    },
    command: {
        type: String,
        required: false
    },
    value: {
        type: String,
        required: false
    },
    editingChannel: {
        type: Number,
        required: false
    },
    mainMessage: {
        type: Number,
        required: false
    },
    messagesToDelete: {
      type: [Number],
      required: false
    },
    cleanMessages: {
        type: Boolean,
        required: false
    },
    preEdit: {
        type: Number,
        required: false
    },
    secondValue: {
        type: Number,
        required: false
    },
    err: {
        type: Number,
        required: false
    }
});

export const Admin = mongoose.model('Admin', AdminSchema);