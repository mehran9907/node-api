
import BaseMiddleware from '../core/BaseMiddleware.js';
import { log, getEnv } from '../core/utils.js';

export default class CorsMiddleware extends BaseMiddleware
{
    constructor(){
        super();
    }

    async handle(req,res,next){
        try{
            const allowedOrigins = getEnv("ALLOW_ORIGIN").split(",");
            const requestOrigin = req.headers.origin ?? '';
            if(requestOrigin !== '') {
                const index = allowedOrigins.findIndex((value) => value === requestOrigin);
                if(index !== -1) {
                    res.set({
                        "Access-Control-Allow-Origin": allowedOrigins[index],
                        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
                        "Access-Control-Allow-Headers": "Content-Type,X-Token"
                    });
                }
            }
            next();    
        }
        catch(e){
            next();
        }
    }
}