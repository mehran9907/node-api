import BaseMiddleware from '../core/BaseMiddleware.js';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from '../global.js';

export default class RateLimitMiddleware extends BaseMiddleware
{
    #rateLimiter = null;
    constructor(key, points, durationSecond, blockDurationSecond = 60){
        super();
        const config = {
            storeClient: Redis.redis,
            keyPrefix: key,
            points: points, // Number of requests
            duration: durationSecond, // per seconds
            blockDuration: blockDurationSecond // block IP per seconds
        };
        this.#rateLimiter = new RateLimiterRedis(config);
    }

    async handle(req,res,next){
        try{
            this.#rateLimiter.consume(req.ip).then(() => {
                next();
            }).catch(() => {
                res.status(429).send("To many requests!");
            });
        }
        catch(e){
            return super.toError(e,req,res);
        }
    }

}