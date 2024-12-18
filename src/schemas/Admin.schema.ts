import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    _id: Number,
    username: {
        required: false,
        type: String
    },
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
    },
    isTrueAdmin: {
        type: Boolean,
        required: false
    },
    isHeadAdmin: {
        type: Boolean,
        required: false
    },
    displayName: {
        required: false,
        type: String
    },
    futurePost: {
        type: {
            channels: [Number],
            text: String,
            image: {
                type: Schema.Types.Mixed,
                required: false
            },
            timeOut: {
                type: Number,
                default: 0,
                required: false,
            },
            entities: {
                type: [{offset: Number, length: Number, etype: String, url: {type: String, required: false}}],
                default: [],
                required: false
            },
            buttons: {
                type: [{text: String, url: String, row: Boolean}],
                default: [],
                required: false
            },
            autoDelete: {
                type: Number,
                required: false
            }
        },
        required: false
    },
});

export const Admin = mongoose.model('Admin', AdminSchema);