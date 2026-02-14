import { Schema } from "mongoose";

/* 
    status:
        0 -> disabled
        1 -> blocked
        2 -> OK
*/

export default new Schema ({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0,
        required: true
    },
    register_date_time: {
        type: Date,
        required: true
    },
    last_edit_date_time: {
        type: Date
    },
    avatar: {
        type: String
    }
});