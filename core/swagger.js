import BaseMiddleware from './BaseMiddleware.js';
import swaggerJsDoc from 'swagger-jsdoc';
import { getEnv } from './utils.js';
import userPaths from '../swagger-docs/user.js';
import categoryPaths from '../swagger-docs/category.js';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: getEnv('SWAGGER_TITLE'),
            version: getEnv('SWAGGER_VERSION'),
        },
        servers: [
            {
                url: getEnv('API_URL')
            }
        ]
    },
    apis: ['./routes/*.js'],
    swaggerDefinition: {
        paths: {
            ...userPaths,
            ...categoryPaths
        }
    }
};

export default swaggerJsDoc(options);
            