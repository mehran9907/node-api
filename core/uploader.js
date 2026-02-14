import { random } from "./utils.js";
import datetime from "./datetime.js";
import crypto from "./crypto.js";

export function checkImgMime(type) {
    try {
        const allowImgMimes = [
            { mime: "image/png", ext: "png" },
            { mime: "image/jpg", ext: "jpg" },
            { mime: "image/jpeg", ext: "jpeg" },
            { mime: "image/gif", ext: "gif" },
        ];
        const result = allowImgMimes.find((item) => {
            return item.mime === type;
        });
        return result?.ext ?? '';
    } catch (e) {
        return '';
    }
}

export function checkDocMime(type) {
    const allowDocMimes = [
        { "image/png": "png" },
        { "image/jpg": "jpg" },
        { "image/jpeg": "jpeg" },
        { "image/gif": "gif" },
    ];
}

export function fileNameGenerator(name, ext) {
    try {
        return name + '-' + crypto.hash(datetime.getTimeStamp() + random(1000000000000, 9999999999999)) + '.' + ext;
    } catch (e) {
        return '';
    }
}

export function toByte(size, type = 'B') {
    try {
        const types = ["B", "KB", "MB", "GB", "TB"];
        const key = types.indexOf(type.toUpperCase());
        if (typeof key !== "boolean")
            return size * 1024 ** key;
        else
            return 0;
    } catch (e) {
        return 0;
    }
}