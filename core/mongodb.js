import mongoose from "mongoose";
import { log } from "./utils.js";

class MongoDB {
    #db = null;

    get db() {
        return this.#db;
    }

    async connect(URI) {
        try {
            this.#db = await mongoose.createConnection(URI).asPromise();
            return true;
        } catch (e) {
            log(`MongoDB error: ${e.toString()}`);
            return false;
        }
    }
}

export default MongoDB;