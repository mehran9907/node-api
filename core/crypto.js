import crypto from 'crypto';
import { getEnv,log } from './utils.js';

class Crypto
{
    hash(str)
    {
        try{
            return crypto.createHmac('sha256',getEnv('SECRET_KEY'))
                .update(str.toString()).digest('hex');
        }
        catch(e){
            return '';
        }
    }

    toBase64(str)
    {
        try{
            return Buffer.from(str.toString()).toString('base64url');
        }
        catch(e){
            return '';
        }
    }

    fromBase64(str)
    {
        try{
            return Buffer.from(str.toString(),'base64url').toString('utf8');
        }
        catch(e){
            return '';
        }
    }

    encryption(key,data)
    {
        try{
            const hashKey = this.hash(key);
            const key2 = hashKey.substring(0,32);
            const iv = hashKey.slice(32,-16);
            const data2 = {
                "a" : Math.random(),
                "message" : data,
                "z" : Math.random(),
            };
            const dataFinal = JSON.stringify(data2);
            const cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(key2),iv);
            let encrypted = cipher.update(dataFinal,'utf8','base64');
            encrypted += cipher.final('base64');
            return this.toBase64(encrypted);
        }
        catch(e){
            return '';
        }
    }

    decryption(key,data)
    {
        try{
            const hashKey = this.hash(key);
            const key2 = hashKey.substring(0,32);
            const iv = hashKey.slice(32,-16);
            data = this.fromBase64(data);
            const decipher = crypto.createDecipheriv('aes-256-cbc',Buffer.from(key2),iv);
            let decrypred = decipher.update(data,'base64','utf8');
            decrypred += decipher.final('utf8');
            const decrypredFinal = JSON.parse(decrypred);
            return decrypredFinal?.message ?? '';
        }
        catch(e){
            return '';
        }
    }

}


export default new Crypto();