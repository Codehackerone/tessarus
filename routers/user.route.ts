import express from "express";
import userController from "../controllers/user.controller";
import {
  validateSignUp,
  validateLogin,
  validateUpdateUser,
  validateResetPassword,
  validateOTPSchema,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/user.authorization";
import multer from "multer";
const upload = multer({ dest: "./uploads/" });

const Router = express.Router();

Router.route("/login").post(validateLogin(), userController.login);

Router.route("/signup").post(validateSignUp(), userController.signUp);

Router.route("/sendmail").patch(
  authorize(),
  userController.sendVerificationMail
);

Router.route("/sendotp").post(authorize(), userController.sendOTP);

Router.route("/sendotpreset").post(authorize(), userController.sendOTPForReset);

Router.route("/verifyotpforuser").post(
  authorize(),
  validateOTPSchema(),
  userController.verifyOTPForUserVerification
);

Router.route("/verifyotpforreset").post(
  authorize(),
  validateOTPSchema(),
  userController.verifyOTPForResetPassword
);

//Router.route("/verifytoken").post(authorize(), userController.verifyToken);

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
