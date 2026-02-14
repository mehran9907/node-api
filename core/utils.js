import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import mongoose from 'mongoose';
import process from 'process';
import crypto from './crypto.js';
import datetime from './datetime.js';
const env = dotenv.config();
dotenvExpand.expand(env);

/*
    string -> default
    number
    bool
*/
export function getEnv(key, cast = 'string') {
    let ret = '';
    switch (cast) {
        case 'number':
            ret = toNumber(process.env[key]);
            break;
        case 'bool':
            ret = (process.env[key] === 'true') ? true : false;
            break;
        default:
            ret = process.env[key];
            break;
    }
    return ret ?? '';
}

export function log(obj) {
    console.log(obj);
}

export function toNumber(str) {
    try {
        const ret = Number(str);
        return isNaN(ret) ? 0 : ret;
    }
    catch (e) {
        return 0;
    }
}


export function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}

export function random(min, max) {
    try {
        return Math.floor(
            Math.random() * (max - min + 1) + min
        );
    }
    catch (e) {
        return 0;
    }
}

export function stringify(obj) {
    try {
        return JSON.stringify(obj);
    }
    catch (e) {
        return '';
    }
}

export function toJSON(str) {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return {};
    }
}

export function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export function toObjectId(str, to_string = false) {
    try {
        if (mongoose.Types.ObjectId.isValid(str))
            return to_string ? mongoose.Types.ObjectId.createFromHexString(str) + '' : mongoose.Types.ObjectId.createFromHexString(str);
        else
            return '';
    } catch (e) {
        return '';
    }
}

export function getPath() {
    return process.cwd() + '/';
}