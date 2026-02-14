import { Router } from "express";
import AuthMiddleware from "../middlewares/auth.js";
import UserController from "../controllers/UserController.js";
const userController = new UserController();

const route = Router();
try {
    route.post('/login', userController.login);
    route.get('/profile', new AuthMiddleware().checkLogin, userController.profile);
    route.post('/refresh-token', userController.refreshToken);
    route.get('/logout', new AuthMiddleware().checkLogin, userController.logout);
    route.put('/upload-avatar', new AuthMiddleware().checkLogin, userController.uploadAvatar);
    route.delete('/delete-avatar', new AuthMiddleware().checkLogin, userController.deleteAvater);
}
catch (e) {
    route.use(userController.errorHandling(e.toString()));
}

export default route;