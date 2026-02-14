
import BaseMiddleware from '../core/BaseMiddleware.js';
import {log} from '../core/utils.js';
import fileUpload from 'express-fileupload';

export default class FileUploadMiddleware extends BaseMiddleware
{
    constructor(){
        super();
    }

    async handle(req,res,next){
        try{
            fileUpload({
                useTempFiles : true,
                tempFileDir : '/tmp/'
            })(req,res,next);
        }
        catch(e){
            return super.toError(e,req,res);
        }
    }

}