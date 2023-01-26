import express from "express";
import { signUp, login, verifyToken } from "../controllers/user.controller";
import {
    validateSignUp,
    validateLogin,
} from "../middlewares/validator.middleware";

//import { authorize } from "../middlewares/authorization";

const Router = express.Router();

//Router.route("/verifytoken").all(authorize(), verifyToken);

Router.route("/login").post(validateLogin(), login);

Router.route("/signup").post(validateSignUp(), signUp);

export default Router;
