import { Schema } from "mongoose";

/* 
    status:
        0 -> disabled
        1 -> blocked
        2 -> OK
*/

export default new Schema ({
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: "category"
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        required: true
    },
    title_seo: {
        type: String,
    },
    description_seo: {
        type: String,
    },
    last_edit_date_time: {
        type: Date
    }
});