import { Schema } from "mongoose";

export default new Schema ({
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
        type: Boolean,
        default: true
    },
    register_date_time: {
        type: Date,
        required: true
    }
});