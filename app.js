import Application from "./application.js";
import {log} from './core/utils.js';
async function main()
{
    try{
        const app = new Application();
        await app.run();
    }
    catch(e){
        log(`Error on : main ${e.toString()}`);
    }
}

main();