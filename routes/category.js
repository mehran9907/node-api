import { Router } from "express";
import AuthMiddleware from "../middlewares/auth.js";
import CategoryController from "../controllers/CategoryController.js";
const categoryController = new CategoryController();

const route = Router();
try {
    route.get('/', new AuthMiddleware().checkLogin, categoryController.index);
    route.post('/add', new AuthMiddleware().checkLogin, categoryController.add);
    // route.post('/edit/:id', new AuthMiddleware().checkLogin, categoryController.postEdit);
    // route.get('/delete/:id', new AuthMiddleware().checkLogin, categoryController.delete);
}
catch (e) {
    route.use(categoryController.errorHandling(e.toString()));
}

export default route;