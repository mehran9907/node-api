import Redis from "./core/redis.js";
import MongoDB from "./core/mongodb.js";

const RedisObject = new Redis();
const MongoObject = new MongoDB();

export {
    RedisObject as Redis,
    MongoObject as MongoDB
};