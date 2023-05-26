import express from "express";
import userController from "../controllers/user.controller";
import {
  validateSignUp,
  validateLogin,
  validateUpdateUser,
  //validateResetPassword,
  validateOTPSchema,
  validatePrizeAddSchema,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/user.authorization";
import { authorize as volunteerAuthorize } from "../middlewares/volunteer.authorization";
import { mailLimiter } from "../helpers/rateLimiter";
// import multer from "multer";
// const upload = multer({ dest: "./uploads/" });

const Router = express.Router();

// login user
Router.route("/login").post(validateLogin(), userController.login);

// signup user
Router.route("/signup").post(validateSignUp(), userController.signUp);

// Router.route("/sendmail").patch(
//   authorize(),
//   userController.sendVerificationMail,
// );

// send otp for new registration
Router.route("/sendotp").post(authorize(), mailLimiter, userController.sendOTP);

// send otp for reset password
Router.route("/sendotpreset").post(mailLimiter, userController.sendOTPForReset);

// verify otp for new registration
Router.route("/verifyotpforuser").post(
  authorize(),
  validateOTPSchema(),
  userController.verifyOTPForUserVerification,
);

// verify otp for reset password
Router.route("/verifyotpforreset").post(
  validateOTPSchema(),
  userController.verifyOTPForResetPassword,
);

//Router.route("/verifytoken").post(authorize(), userController.verifyToken);

// update user details
Router.route("/update").put(
  authorize(),
  validateUpdateUser(),
  userController.updateUser,
);

// get user details
Router.route("/profile").get(authorize(), userController.userProfile);

// Router.route("/updateprofilepic").put(
//   authorize(),
//   upload.single("image"),
//   userController.updateProfilePic,
// );

// Router.route("/forgotpassword")
//   .post(userController.forgotPassword)
//   .put(validateResetPassword(), userController.resetPassword);

// check expektroid exist and whether registered for an event
Router.route("/verifyespektroid/:id").get(userController.verifyEspektroId);

// invite user to register
Router.route("/inviteuser").post(
  authorize(),
  mailLimiter,
  userController.inviteUser,
);

// transaction details
Router.route("/transaction")
  .post(authorize(), userController.createTransaction)
  //.put(authorize(), userController.updateTransaction)
  .patch(authorize(), userController.refreshTransaction);

// add prizes to user
Router.route("/addprizetouser").post(
  volunteerAuthorize(1),
  validatePrizeAddSchema(),
  userController.addPrizeWinner,
);

export default Router;
