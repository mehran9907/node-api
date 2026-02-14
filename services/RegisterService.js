import {log,getEnv,sleep,toJSON} from './../core/utils.mjs';
import Redis from '../core/redis.mjs';

class RegisterService
{

    #redis = null;

    constructor(){
        log('RegisterService is start ...');
    }

    async run(){
        this.#redis = new Redis();
        const redisStatus =  await this.#redis.connect(getEnv('REDIS_URI'));
        if(!redisStatus)
        {
            log('Redis Can not Connect');
            process.exit(-1);
        }

        await this.#redis.redis.subscribe('news1');
        this.#redis.redis.on('message',async(channel,message)=>{
            log('channel => ' + channel);
            log('message => ' + message);
        });

    }



}



async function main()
{
    try{
        const obj = new RegisterService();
        await obj.run();
    }
    catch(e){
        log(`RegisterService Error on : ${e.toString()}`);
    }
}

main();