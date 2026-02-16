import AdminSchema from "../schemas/admin.js";
import { log, toObjectId, toJSON, getEnv } from "../core/utils.js";
import datetime from "../core/datetime.js";
import { MongoDB } from "../global.js";
import crypto from "../core/crypto.js";

export default class AdminModel {
    constructor() {
        this.model = MongoDB.db.model("admin", AdminSchema);
    }

    #hashPassword(password, userId) {
        return crypto.hash(userId + password + userId);
    }

    async login(email, password) {
        try {
            const row = await this.model.findOne({ email: email });
            if (row?._id) {
                const result = row.toJSON();
                const userId = result?._id + "";
                if (this.#hashPassword(password, userId) === result?.password) {
                    if (result?.status === 2) {
                        return result;
                    } else {
                        switch (result?.status) {
                            case 0:
                                return -2; // account is blocked
                            case 1:
                                return -3; // account is disabled
                        }
                    }
                } else {
                    return -1;
                }
            } else {
                return -1; // email or password is not correct
            }
        } catch (e) {
            log(e.toString());
            return -1;
        }
    }

    async getUserData(data) {
        delete data._id;
        delete data?.password;
        if (data?.avatar) {
            const avatarUrl = getEnv('API_URL') + data['avatar'];
            data['avatar'] = avatarUrl;
        }
        return data;
    }

    async getProfile(admin_id) {
        admin_id = toObjectId(admin_id);
        if (admin_id) {
            const data = await this.model.findOne({ _id: admin_id });
            if (data)
                return data.toJSON();
            else
                return null;
        } else {
            return null;
        }
    }

    async checkEmail(email) {
        try {
            return await this.model.findOne({ email: email }).countDocuments();
        } catch (e) {
            log(e.toString());
            return false;
        }
    }

    async saveProfile(admin_id, first_name, last_name, email, current_password, new_password, new_password_confirm) {
        try {
            const currentUser = await this.getProfile(admin_id);
            const last_edit_date_time = datetime.toString();
            const data = {first_name, last_name, last_edit_date_time};

            if (email != "") {
                if (currentUser?.email !== email) {
                    const emailExists = await this.checkEmail(email);
                    if (emailExists > 0) {
                        return -1; // Email is already exists
                    }
                    data['email'] = email;
                }
            }
            if (current_password !== "" && new_password !== "" && new_password_confirm !== "") {
                if (this.#hashPassword(current_password, currentUser?._id + '') !== currentUser?.password) {
                    return -2; // Old password is invalid
                } else {
                    data['password'] = this.#hashPassword(new_password_confirm, currentUser?._id + '');
                }
            }

            await this.model.updateOne({ _id: admin_id },{ $set: data });
            return 1;
        } catch (e) {
            log(e.toString());
            return 0;
        }
    }

    async deleteAvatar(admin_id) {
        try {
            const last_edit_date_time = datetime.toString();
            const data = {avatar: "", last_edit_date_time: last_edit_date_time };
            await this.model.updateOne({ _id: admin_id },{ $set: data });
            return 1;
        } catch (e) {
            log(e.toString());
            return 0;
        }
    }

    async updateAvatar(admin_id, avatar) {
        try {
            const last_edit_date_time = datetime.toString();
            const data = {"avatar": avatar, "last_edit_date_time": last_edit_date_time };
            await this.model.updateOne({ "_id": admin_id },{ "$set": data });
            return 1;
        } catch (e) {
            log(e.toString());
            return 0;
        }
    }
}