import ioredis,{Command} from 'ioredis';
import {log,toNumber,stringify,isJSON,toJSON} from './utils.js';

class Redis
{
    #URI = null;
    #redis = null;

    get redis()
    {
        return this.#redis;
    }
    
    async connect(URI)
    {
        try{
            this.#URI = URI;
            this.#redis = new ioredis(this.#URI,{lazyConnect:true});
            await this.#redis.connect();  
            return true;
        }
        catch(e){
            return false;
        }
    }


    async set(key,data,ex=0)
    {
        try{
            data = (typeof data === 'string') ? data : stringify(data); 
            ex = toNumber(ex) > 0 ? ex : 0;
            if(ex > 0)  
                await this.#redis.set(key,data,"EX",ex);
            else
                await this.#redis.set(key,data);
        }
        catch(e){
            return false;
        }
    }

    async get(key)
    {
        try{
            const result = await this.#redis.get(key);
            if(result)
            {
                return isJSON(result) ? toJSON(result) : result;
            }
            else    
                return '';
        }
        catch(e){
            return '';
        }
    }


    async del(key)
    {
        try{
            await this.#redis.del(key);
            return true;
        }
        catch(e){
            return false;
        }
    }

    async keys(pattern){
        try{
            return await this.#redis.keys(pattern);
        }
        catch(e)
        {
            return [];
        }
    }

    async setHash(key,data={},ex=0)
    {
        try{
            ex = toNumber(ex) > 0 ? ex : 0;
            await this.#redis.hset(key,data);
            if(ex > 0)
                await this.#redis.expire(key,ex);
            return true;
        }
        catch(e){
            return false;
        }
    }   


    async getHash(key)
    {
        try{
            return await this.#redis.hgetall(key);
        }
        catch(e){
            return {};
        }
    } 


    async delHash(key,...fields)
    {
        try{
            await this.#redis.hdel(key,fields);
            return true;
        }
        catch(e){
            return false;
        }
    } 

    async ftCreate(indexName,keySpace,schema = '')
    {
        try{
            await this.ftDropIndex(indexName);
            const cmd = new Command('FT.CREATE'
            ,[indexName,'ON','HASH','PREFIX',1,keySpace,'SCHEMA',schema.split(' ')],'utf-8');
            await this.#redis.sendCommand(cmd);
            return true;
        }
        catch(e){
            return false;
        }
    } 

    async ftDropIndex(indexName)
    {
        try{
            const cmdInfo = new Command('FT.DROPINDEX',[indexName,'KEEPDOCS'],'utf-8');
            await this.#redis.sendCommand(cmdInfo);
            return true;
        }
        catch(e){
            return false;
        }
    } 



    async ftSearch(indexName,query,params = '')
    {
        try{    
            const paramsEnd = params.length === 0 ? [] : params.split(' ');
            const result = await this.#redis.call('FT.SEARCH',indexName,query,paramsEnd);
            return this.#toObject(result);
        }
        catch(e){
            return {"count":0,"rows":[]};
        }
    } 


    #toObject(data = [])
    {
        try{
            //limit 0 0 => count 
            if(data.length === 1)
            {
                return {"count":data[0],"rows":[]};
            }
            else
            {
                const ret = {"count":data[0]};//count rows
                data.shift();
                const rows = [];
                let keyObject = {};
                let item = {};
                for(let row of data)
                {
                    if(typeof row === 'string')
                    {
                        keyObject['key'] = row;
                    }
                    else if(typeof row === 'object')
                    {
                        for(let i = 0 ; i < row.length ; i += 2)
                        {
                            const key = row[i];
                            const value = row[i+1];
                            item[key] = value;
                        }
                    }
                    if(Object.keys(keyObject).length > 0 && Object.keys(item).length > 0)
                    {
                        const newObject = Object.assign({},item,keyObject);
                        keyObject = {};
                        item = {};
                        rows.push(newObject);
                    }
                }

                ret['rows'] = rows;
                return ret;
            }
        }
        catch(e){
            return {"count":0,"rows":[]};
        }
    }
    

}


export default Redis;
