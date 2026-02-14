import { Router } from "express";
import HomeController from "../controllers/HomeController.js";
const homeController = new HomeController();

const route = Router();
try {
    route.get('/', homeController.getIndex);
}
catch (e) {
    route.use(homeController.errorHandling(e.toString()));
}

export default route;