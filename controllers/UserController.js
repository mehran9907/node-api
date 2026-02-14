import BaseController from "../core/BaseController.js";
import translate from "../core/translate.js";
import AdminModel from "../models/admin.js";
import { body, validationResult } from "express-validator";
import { getEnv, getPath, log, toObjectId } from "../core/utils.js";
import { checkImgMime, fileNameGenerator, toByte } from "../core/uploader.js";
import { fileExists, unlink } from "../core/fs.js";
import Token from "../core/token.js";
import { Redis } from "../global.js";

export default class UserController extends BaseController {
    #adminModel = null;
    #url = getEnv('APP_URL') + 'user/';
    constructor() {
        super();
        this.#adminModel = new AdminModel();
    }

    async login(req, res) {
        try {
            const email = this.safeString(this.input(req.body.email));
            const password = this.input(req.body.password);

            const result = await this.#loginValidation(req);
            if (!result.isEmpty()) {
                return res.json(result?.errors[0]?.msg);
            }
            const resultLogin = await this.#adminModel.login(email, password);

            if (resultLogin?._id) {
                const token = await Token.generate(resultLogin?._id, resultLogin?.status);

                if (typeof token === 'string') {
                    return res.json({ "code": 5, "msg": "Failed generatin token!" });
                } else {
                    const userData = await this.#adminModel.getUserData(resultLogin);
                    const data = {
                        "user_info": userData,
                        "access_token": token?.access_token,
                        "refresh_token": token?.refresh_token
                    };
                    return res.json({"code": 0, "msg": translate.t("user.login_success"), "data": data});
                }
            } else {
                switch(resultLogin) {
                    case -1:
                        return res.json({"code": 4, "msg": translate.t("user.wrong_credentials")});
                    case -2:
                        return res.json({"code": 5, "msg": translate.t("user.account_disabled")});
                    case -3:
                        return res.json({"code": 6, "msg": translate.t("user.account_blocked")});
                }
            }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async #loginValidation(req) {
        await body('email').not().isEmpty().withMessage({ code: 1, "msg": translate.t('user.validation_email_required') })
        .isEmail().withMessage({ code: 2, "msg": translate.t('user.validation_isEmail') }).run(req);
        await body('password').not().isEmpty().withMessage({ code: 3, "msg": translate.t('user.validation_password_required') }).run(req);
        return validationResult(req);
    }

    async logout(req, res) {
        try {
            await Redis.del(getEnv('ACCESS_TOKEN_PREFIX') + req?.userToken?.access_token);
            await Redis.del(getEnv('REFRESH_TOKEN_PREFIX') + req?.userToken?.refresh_token);
            return res.json({"code": 0, "msg": "Logout success", "is_auth": 0});
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async profile(req, res) {
        try {
            const user = await this.#adminModel.getProfile(req.userToken?.user_id);
            const userData = await this.#adminModel.getUserData(user);
            return res.json({"code": 0, "msg": "Proile info","data": userData, "is_auth": 0});
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async uploadAvatar(req, res) {
        try {
            const user = await this.#adminModel.getProfile(req.userToken?.user_id);
            let currentAvatar = user?.avatar ?? '';
                if (currentAvatar === "") {
                    if (req?.files?.avatar) {
                        if (req?.files?.avatar?.size <= toByte(5, 'MB')) {
                            const ext = checkImgMime(req?.files?.avatar?.mimetype);
                            if (ext !== '') {
                                const fileName = 'avatars/' + fileNameGenerator('avatar', ext);
                                const path = getPath() + 'media/' + fileName;
                                await req.files.avatar.mv(path);
                                const avatarURL = getEnv('API_URL') + fileName;
                                await this.#adminModel.updateAvatar(req.userToken?.user_id, fileName);
                                return res.json({"code": 0, "msg": "success", "is_auth": 0, "data": avatarURL});
                            } else {
                                return res.json({"code": 4, "msg": translate.t('avatar_upload_not_allow'), "is_auth": 0});
                            }
                        } else {
                            return res.json({"code": 3, "msg": translate.t('avatar_min_size'), "is_auth": 0});
                        }
                    } else {
                        return res.json({"code": 2, "msg": translate.t('avatar_not_sent'), "is_auth": 0});
                    }
                } else {
                    return res.json({"code": 1, "msg": translate.t('avatar_already_uploaded'), "is_auth": 0});
                }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async deleteAvater(req, res) {
        try {
            const user = await this.#adminModel.getProfile(req?.userToken?.user_id);
            const currentAvatar = user?.avatar;
            if (currentAvatar !== '') {
                const path = getPath() + "media/" + currentAvatar;
                if (fileExists(path)) {
                    unlink(path);
                }
                await this.#adminModel.deleteAvatar(req?.userToken?.user_id);
                return res.json({"code": 0, "msg": translate.t('avatar_success_remove'), "is_auth": 0});
            } else {
                return res.json({"code": 1, "msg": translate.t('no_avatar_found'), "is_auth": 0});
            }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async postProfile(req, res) {
        try {
            if (!this.checkCsrfToken(req)) {
                return res.redirect(`${this.#url}profile?msg=invalid-csrf`);
            }
            const email = this.safeString(this.input(req.body.email));
            const first_name = this.safeString(this.input(req.body.first_name));
            const last_name = this.safeString(this.input(req.body.last_name));
            const pass1 = this.safeString(this.input(req.body.pass1));
            const pass2 = this.safeString(this.input(req.body.pass2));
            const pass3 = this.safeString(this.input(req.body.pass3));
            const result = await this.#saveProfileValidation(req);
            if (!result.isEmpty()) {
                return res.redirect(`${this.#url}profile?msg=${result?.errors[0]?.msg}`);
            } else {
                const data = {first_name, last_name, email, pass1, pass2, pass3};
                let avatar = req.session.admin_info?.avatar ?? '';
                if (avatar === "" && req?.files?.avatar) {
                    if (req?.files?.avatar?.size <= toByte(5, 'MB')) {
                        const ext = checkImgMime(req?.files?.avatar?.mimetype);
                        if (ext !== '') {
                            const fileName = 'avatars/' + fileNameGenerator('avatar', ext);
                            const path = getPath() + 'media/' + fileName;
                            await req.files.avatar.mv(path);
                            data.avatar = fileName;
                        } else {
                            return res.redirect(`${this.#url}profile?msg=err12`);
                        }
                    } else {
                        return res.redirect(`${this.#url}profile?msg=err11`);
                    }
                }
                const admin_id = req.session.admin_id;
                const result = await this.#adminModel.saveProfile(admin_id, data);
                req.session.admin_info = await this.#adminModel.getProfile(admin_id);
                
                if (result == 1) {
                    return res.redirect(`${this.#url}profile?msg=ok`);
                } else if (result == -1) {
                    return res.redirect(`${this.#url}profile?msg=err5`);
                } else if (result == -2) {
                    return res.redirect(`${this.#url}profile?msg=err10`);
                } else {
                    return res.redirect(`${this.#url}profile?msg=err6`);
                }
            }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async refreshToken(req, res) {
        try {
            const access_token = this.safeString(this.input(req.body.access_token));
            const refresh_token = this.safeString(this.input(req.body.refresh_token));
            const data = await Redis.getHash(getEnv('REFRESH_TOKEN_PREFIX') + refresh_token);
            if (data?.refresh_token && access_token === data?.access_token) {
                await Redis.del(getEnv('REFRESH_TOKEN_PREFIX') + refresh_token);
                await Redis.del(getEnv('ACCESS_TOKEN_PREFIX') + access_token);
                const token = await Token.generate(data?.user_id, data?.status);
                if (typeof token === "string") {
                    return res.json({"code": 2, "msg": "Failed generating token!"});
                } else {
                    const redisData = {
                        "access_token": token?.access_token,
                        "refresh_token": token?.refresh_token,
                        "user_id": token?.user_id,
                        "status": token?.status
                    };
                    return res.json({"code": 0, "msg": "success", "data": redisData});
                }
            } else {
                return res.json({"code": 1, "msg": "Refresh token is not valid"});
            }
            
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async #saveProfileValidation(req) {
        await body('first_name').not().isEmpty().withMessage('err1').run(req);
        await body('last_name').not().isEmpty().withMessage('err2').run(req);
        await body('email').not().isEmpty().withMessage('err3').isEmail().withMessage('err4').run(req);
        await body(['pass1', 'pass2', 'pass3']).custom(() => {
            const pass1 = this.input(req.body.pass1);
            const pass2 = this.input(req.body.pass2);
            const pass3 = this.input(req.body.pass3);
            if (pass1 !== "") {
                if (pass2 === "") {
                    throw new Error("err7");
                }
                if (pass3 === "") {
                    throw new Error("err8");
                }
                if (pass2 !== pass3) {
                    throw new Error("err9");
                }
            }
            return true;
        }).run(req);
        return validationResult(req);
    }
}