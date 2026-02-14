import BaseController from "../core/BaseController.js";

export default class Error500Controller extends BaseController
{
    constructor()
    {
        super();
    }

    async handle(error,req,res,next)
    {
        try{
            return res.status(500).render('500',{"msg": error});
        }
        catch(e){
            return super.toError(e,req,res);
        }
    }
}