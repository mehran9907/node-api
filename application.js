import { log, getEnv } from './core/utils.js';
import express from 'express';
import Error500 from './controllers/Error500Controller.js';
import Error404 from './controllers/Error404Controller.js';
import { MongoDB, Redis } from './global.js';
import CorsMiddleware from "./middlewares/cors.js";
import FileUploadMiddleware from './middlewares/fileupload.js';
import swaggerui from 'swagger-ui-express';
import swagger from './core/swagger.js';

class Application {
    #app = null;

    async #initExpress() {
        try {
            this.#app = express();

            this.#app.use(express.static('assets'));
            this.#app.use(express.static('media'));

            this.#app.use(express.urlencoded({ extended: true, limit: '10mb' }));
            this.#app.use(express.json({ limit: '10mb' }));

            // Middlewares
            this.#app.use(new FileUploadMiddleware().handle);
            this.#app.use(new CorsMiddleware().handle);
        }
        catch (e) {
            log(`Error on : initExpress ${e.toString()}`);
        }
    }

    async #initRoute() {
        try {
            const route = await import('./routes/route.js');
            this.#app.use('/', route.default);
            
            if(getEnv('DEBUG', 'bool')) {
                this.#app.use(getEnv('SWAGGER_ROUTE'), swaggerui.serve, swaggerui.setup(swagger));
            }
            
            this.#app.use(new Error404().handle);
            this.#app.use(new Error500().handle);
        }
        catch (e) {
            log(`Error on : initRoute ${e.toString()}`);
        }
    }

    async #init() {
        // Redis connection
        const redisStatus = await Redis.connect(getEnv('REDIS_URI'));
        if (!redisStatus) {
            log('Redis Can not Connect');
            process.exit(-1);
        }

        // MongoDB connection
        const mongoDBStatus = await MongoDB.connect(getEnv("MONGODB_URI"));
        if (!mongoDBStatus) {
            log('MongoDB Can not Connect');
            process.exit(-1);
        }

        await this.#initExpress();
        await this.#initRoute();
        // await Redis.ftCreate('user', 'user:', 'id TEXT SORTABLE username TEXT SORTABLE password TEXT SORTABLE age TEXT SORTABLE');
    }

    async run() {
        try {
            log(`Application is run!`);
            await this.#init();
            const PORT = getEnv('PORT', 'number');
            this.#app.listen(PORT, async () => {
                log(`app listening on port ${PORT}`);
            });
        }
        catch (e) {
            log(`Error on : run ${e.toString()}`);
        }
    }

}


export default Application;