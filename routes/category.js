import { Router } from "express";
import AuthMiddleware from "../middlewares/auth.js";
import CategoryController from "../controllers/CategoryController.js";
const categoryController = new CategoryController();

const route = Router();
try {
    route.get('/', new AuthMiddleware().checkAuth, categoryController.index);
    route.get('/add', new AuthMiddleware().checkAuth, categoryController.add);
    route.post('/add', new AuthMiddleware().checkAuth, categoryController.postAdd);
    route.get('/edit/:id', new AuthMiddleware().checkAuth, categoryController.edit);
    route.post('/edit/:id', new AuthMiddleware().checkAuth, categoryController.postEdit);
    route.get('/delete/:id', new AuthMiddleware().checkAuth, categoryController.delete);
}
catch (e) {
    route.use(categoryController.errorHandling(e.toString()));
}

export default route;