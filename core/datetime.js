import momentTimeZone from "moment-timezone";
import moment from "moment";
import momentJalaali from 'moment-jalaali';
import {getEnv, log} from './utils.js';

class DateTime
{
    getTimeStamp()
    {
        try{
            return moment.tz(getEnv('TIME_ZONE')).unix();
        }
        catch(e){
            return 0;
        }
    }

    toString(format = 'YYYY-MM-DD HH:mm:ss')
    {
        try{
            return moment.tz(getEnv('TIME_ZONE')).format(format);
        }
        catch(e){
            return '';
        }
    }

    toDateTime(dateTime = '')
    {
        try{
            return (dateTime === '') ? moment.tz(getEnv('TIME_ZONE')) : moment.tz(dateTime,getEnv('TIME_ZONE'));
        }
        catch(e){
            return null;
        }
    }


    toJalaali(str,format = 'jYYYY-jMM-jDD')
    {
        try{
            return momentJalaali(str).format(format);
        }
        catch(e){
            return '';
        }
    }

    toGregorian(str,format = 'YYYY-MM-DD')
    {
        try{
            return momentJalaali(str,'jYYYY-jMM-jDD').format(format);
        }
        catch(e){
            return '';
        }
    }


}


export default new DateTime();