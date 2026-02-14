import BaseController from "../core/BaseController.js";

export default class Error404Controller extends BaseController
{
    constructor()
    {
        super();
    }

    async handle(req,res)
    {
        try{
            return res.status(404).json({ "msg": "Page Not Found" });
        }
        catch(e){
            return super.toError(e,req,res);
        }
    }
}