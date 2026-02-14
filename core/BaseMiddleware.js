import autoBind from 'auto-bind';
import { getEnv,log } from './utils.js';

export default class BaseMiddleware
{
    constructor()
    {
        if(this.constructor === BaseMiddleware)
        {
            throw new Error(`BaseMiddleware is abstract class!`);
        }
        autoBind(this);
    }

    toError(error,req,res)
    {
        const debug = getEnv('DEBUG','bool');
        try{
            if(debug)
                return res.status(500).json({"msg": error.toString()});
            else
                return res.status(500).json({"msg": "Internal Server Error"});
        }
        catch(e){
            if(debug)
                return res.status(500).json({"msg": e.toString()});
            else
                return res.status(500).json({"msg": "Internal Server Error"});
        }
    }


}