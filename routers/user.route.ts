import express from "express";
import userController from "../controllers/user.controller";
import {
  validateSignUp,
  validateLogin,
  validateUpdateUser,
  validateResetPassword,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/user.authorization";
import multer from "multer";
import { storage } from "../helpers/cloudinary";
const upload = multer({ storage });

const Router = express.Router();

Router.route("/login").post(validateLogin(), userController.login);

Router.route("/signup").post(validateSignUp(), userController.signUp);

Router.route("/sendmail").patch(
  authorize(),
  userController.sendVerificationMail
);

Router.route("/verifytoken").post(authorize(), userController.verifyToken);

Router.route("/update").put(
  authorize(),
  validateUpdateUser(),
  userController.updateUser
);

Router.route("/profile").get(authorize(), userController.userProfile);

Router.route("/updateprofilepic").put(
  authorize(),
  upload.single("image"),
  userController.updateProfilePic
);

Router.route("/forgotpassword")
  .post(userController.forgotPassword)
  .put(validateResetPassword(), userController.resetPassword);

export default Router;
