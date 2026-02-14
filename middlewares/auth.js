import BaseMiddleware from '../core/BaseMiddleware.js';
import { getEnv, log } from '../core/utils.js';
import { Redis } from '../global.js';

export default class AuthMiddleware extends BaseMiddleware
{
    constructor(){
        super();
    }

    async checkLogin(req,res,next){
        try{
            let XToken = req.headers['x-token'] ?? '';
            if (XToken !== "") {
                XToken = XToken.trim();
                const accessTokenKey = getEnv('ACCESS_TOKEN_PREFIX') + XToken;
                const userToken = await Redis.getHash(accessTokenKey);
                if (userToken?.user_id) {
                    if (userToken?.status === "2") {
                        req.userToken = userToken;
                        next();
                    } else {
                        switch(userToken?.status) {
                            case "0":
                                return res.json({"code": -3, "msg": "Account is disabled", "is_auth": -3});
                            case "1":
                                return res.json({"code": -4, "msg": "Account is blocked", "is_auth": -4});
                        }
                    }
                } else {
                    return res.json({"code": -2, "msg": "Invalid X-Token", "is_auth": -2});
                }
            } else {
                return res.json({"code": -1, "msg": "X-Token is required!", "is_auth": -1});
            }
        }
        catch(e){
            return super.toError(e,req,res);
        }
    }
}