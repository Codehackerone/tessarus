import express from "express";
import userController from "../controllers/user.controller";
import {
    validateSignUp,
    validateLogin,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/authorization";

const Router = express.Router();

Router.route("/login").post(validateLogin(), userController.login);

Router.route("/signup").post(validateSignUp(), userController.signUp);

Router.route("/sendmail").post(authorize(), userController.sendVerificationMail);

Router.route("/verifytoken").all(authorize(), userController.verifyToken);

export default Router;
