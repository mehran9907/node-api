import autoBind from 'auto-bind';
import { getEnv,log, toNumber, toObjectId } from './utils.js';
import { encode } from 'html-entities';
import {URLSearchParams} from "node:url";

export default class BaseController
{
    constructor()
    {
        if(this.constructor === BaseController)
        {
            throw new Error(`BaseController is abstract class!`);
        }
        autoBind(this);
    }

    toError(error,req,res)
    {
        const debug = getEnv('DEBUG','bool');
        try{
            if(debug)
                return res.status(500).json({ "msg": error.toString() });
            else
                return res.status(500).json({ "msg": "Internal Server Error" });
        }
        catch(e){
            if(debug)
                return res.status(500).json({ "msg": e.toString() });
            else
                return res.status(500).json({ "msg": "Internal Server Error" });
        }
    }

    errorHandling(error)
    {
        try{
            const debug = getEnv('DEBUG','bool');
            return async (req, res, next) => {
                if(debug)
                    return res.status(500).json({ "msg": error.toString() });
                else
                    return res.status(500).json({ "msg": "Internal Server Error" });
            };        
        }
        catch(e){
            throw e;
        }
    }


    input(field) {
        try{
            if(!Array.isArray(field))
            {
                if(typeof field === 'string')
                        return field.trim();
                else
                    return '';
            }
            else    
                return '';
        }
        catch(e){
            return '';
        }
    }

    safeString(str) {
        try {
            return encode(str);
        } catch (e) {
            return '';
        }
    }

    toNumber(str) {
        return toNumber(str);
    }

    getPage(req) {
        try {
            let page = this.toNumber(this.input(req.query?.page));
            return (page <= 0) ? 1 : Math.floor(page);
        } catch (e) {
            return 1;
        }
    }

    getLimit(req) {
        try {
            let limit = this.toNumber(this.input(req?.query?.limit));
            return (limit <= 0 || limit > 100) ? getEnv("ROWS_PER_PAGE", "number") : limit;
        } catch (e) {
            return getEnv("ROWS_PER_PAGE", "number");
        }
    }

    sortHandle(req, sortFields) {
        try {
            if (!req.session?.sort_type) {
                req.session.sort_type = 'desc';
            }

            if (req.query?.sort_type === 'asc')
                req.session.sort_type = 'asc';
            else if (req.query?.sort_type === 'desc')
                req.session.sort_type = 'desc';

            if (!req.session?.sort_field) {
                req.session.sort_field = "_id";
            }

            if (sortFields.includes(req.query?.sort_field))
                req.session.sort_field = req.query?.sort_field;

        } catch (e) {
            
        }
    }

    handlePagination(req, sortFields) {
        try {
            let sort_field = "_id";
            if (req?.query?.sort_field && sortFields.includes(req.query?.sort_field))
                sort_field = req.query?.sort_field;

            const page = this.getPage(req);
            const sort_type = (req?.query?.sort_type === 'asc') ? 1 : -1;
            const limit = this.getLimit(req);

            return { page, sort_field, sort_type, limit };
        } catch (e) {
            return {
                "page":1,
                "sort_field": "_id",
                "sort_type": -1,
                "limit": getEnv("ROWS_PER_PAGE", "number")
            };
        }
    }

    toQuery(query) {
        try{
            return new URLSearchParams(query).toString();
        }
        catch(e){
            return '';
        }
    }

}