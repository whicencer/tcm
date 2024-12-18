import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
    _id: Number,
    name: String,
    greeting: {
        type: [{
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
        }],
        required: false
    },
    captcha: {
        type: Boolean,
        required: false,
        default: false
    },
    leaving: {
        type: [{
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
        }],
        required: false
    },
    autoApprove: {
        type: {
            switched: Boolean,
            timeOut: {
                type: Number,
                default: 0,
            }
        },
        required: false,
        default: {
            switched: false
        },
    },
    requestsList: {
        type: [Number],
        required: false
    },
    futurePost: {
        type: {
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
    admin: String,
    deadMembers: {
        required: false,
        type: Number,
        default: 0
    }
});

export const Channel = mongoose.model('Channel', ChannelSchema);