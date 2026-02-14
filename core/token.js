import { getEnv,log } from './utils.js';
import crypto from './crypto.js';
import { Redis } from '../global.js';

class Token
{
    constructor()
    {
        
    }

    
    async generate(user_id, status) {
        try {
            user_id = user_id + '';
            const accessToken = crypto.encryption(getEnv('SECRET_KEY') + user_id, user_id);
            const refreshToken = crypto.hash(accessToken);

            const data = {
                "access_token": accessToken,
                "refresh_token": refreshToken,
                "user_id": user_id,
                "status": status
            };

            const accessTokenKey = getEnv('ACCESS_TOKEN_PREFIX') + accessToken;
            Redis.setHash(accessTokenKey, data, getEnv('ACCESS_TOKEN_EXPIRE_TIME'));
            const refreshTokenKey = getEnv('REFRESH_TOKEN_PREFIX') + refreshToken;
            Redis.setHash(refreshTokenKey, data, getEnv('REFRESH_TOKEN_EXPIRE_TIME'));
            
            return data;
        } catch(e) {
            return e.toString();
        }
    }

}

export default new Token();