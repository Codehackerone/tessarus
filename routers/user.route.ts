import express from "express";
import userController from "../controllers/user.controller";
import {
  validateSignUp,
  validateLogin,
  validateUpdateUser,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/authorization";

const Router = express.Router();

Router.route("/login").post(validateLogin(), userController.login);

Router.route("/signup").post(validateSignUp(), userController.signUp);

Router.route("/sendmail").post(
  authorize(),
  userController.sendVerificationMail
);

Router.route("/verifytoken").post(authorize(), userController.verifyToken);

Router.route("/update").post(
  authorize(),
  validateUpdateUser(),
  userController.updateUser
);

Router.route("/profile").get(authorize(), userController.userProfile);

export default Router;
