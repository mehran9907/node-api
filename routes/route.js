import { Router } from "express";
import userRoute from './user.js';
import homeRoute from './home.js';
import categoryRoute from './category.js';

const route = Router();
route.use('/', homeRoute);
route.use('/user/', userRoute);
route.use('/category/', categoryRoute);
export default route;