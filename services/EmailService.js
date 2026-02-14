import {log,getEnv,sleep,toJSON} from './../core/utils.mjs';
import Redis from '../core/redis.mjs';

class EmailService
{

    #redis = null;
    #redis2 = null;

    constructor(){
        log('EmailService is start ...');
    }

    async run(){
        this.#redis = new Redis();
        this.#redis2 = new Redis();

        const redisStatus =  await this.#redis.connect(getEnv('REDIS_URI'));
        if(!redisStatus)
        {
            log('Redis Can not Connect');
            process.exit(-1);
        }

        const redisStatus2 =  await this.#redis2.connect(getEnv('REDIS_URI'));
        if(!redisStatus2)
        {
            log('Redis2 Can not Connect');
            process.exit(-1);
        }

        await this.#redis.redis.subscribe('__keyspace@0__:email_list');
        this.#redis.redis.on('message',async (channel,message) => {
            if(message === 'rpush')
            {
                const item = await this.#redis2.redis.lpop("email_list");
                if(item)
                {
                    //log('channel => ' + channel);
                    //log('message => ' + message);    
                    const data = toJSON(item);
                    log(data);
                    await sleep(data?.sleep);
                    log(`send email to ${data?.email}`);
                }    
            }
        });


    }


    
    async loop(){
        try{
            const item = await this.#redis.redis.lpop("email_list");
            if(item)
            {
                const data = toJSON(item);
                log(data);
                await sleep(data?.sleep);
                log(`send email to ${data?.email}`);
            }
            await this.loop();    
        }
        catch(e){
            log(e.toString());
        }
    }   

}



async function main()
{
    try{
        const obj = new EmailService();
        await obj.run();
    }
    catch(e){
        log(`EmailService Error on : ${e.toString()}`);
    }
}

main();