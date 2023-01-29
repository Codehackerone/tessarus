import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import userService from "../services/user.service";
import { message, messageCustom, messageError } from "../helpers/message";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
} from "../helpers/messageTypes";
import getRandomId from "../helpers/randomTextGenerator";
import { createLogService } from "../services/log.service";
import sendMail from "../helpers/sendEmail";

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

const signUp = async (req: any, res: any) => {
  try {
    req.body.espektroId = "E" + getRandomId(10);
    var user: any = await userService.signUpService(req.body);
    const access_token = jwt.sign(
      { email: user.email, user_id: user._id },
      String(process.env.JWT_SECRET),
      jwt_headers
    );
    var return_object: any = {
      user: user,
      auth_token: access_token,
    };
    await createLogService({
      logType: "USER_SIGNUP",
      userId: new ObjectId(user._id),
      description: user.name + " signed up",
    });
    messageCustom(
      res,
      CREATED,
      "User registration completed successfully.",
      return_object
    );
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      if (Number(err.code) === 11000) {
        messageError(
          res,
          CONFLICT,
          `${Object.keys(err.keyValue)[0]} '${
            Object.values(err.keyValue)[0]
          }' already exists.`,
          err.name
        );
      } else {
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

const login = async (req: any, res: any) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    const user: any = await userService.findUserService({ email });
    if (!user) {
      var err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      var err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    const access_token = jwt.sign(
      { email: user.email, user_id: user._id },
      String(process.env.JWT_SECRET),
      jwt_headers
    );
    var return_object: any = {};
    return_object.auth_token = access_token;
    return_object.user = Object.assign({}, user)["_doc"];
    delete return_object.user.password;
    await createLogService({
      logType: "USER_LOGIN",
      userId: new ObjectId(user._id),
      description: user.name + " logged in",
    });
    messageCustom(res, OK, "Successfully logged in", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const sendVerificationMail = async (req: any, res: any) => {
  try {
    let email = req.user.email;
    let frontEndUrl: string = String(process.env.FRONTEND_HOSTED_URL);
    let text: any =
      " Click here to verify your email: " +
      frontEndUrl +
      req.headers["authorization"].split(" ")[1];
    let resMail: any = await sendMail(
      email,
      "Espektro KGEC - Verify your email address",
      text
    );
    if (resMail.hasError === true) throw resMail.error;
    await createLogService({
      logType: "EMAIL_SENT",
      userId: new ObjectId(req.user._id),
      description: req.user.name + " requested for email verification",
    });
    message(res, OK, "Verification code sent to your email");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const verifyToken = async (req: any, res: any) => {
  if (req.user.verified) {
    message(res, OK, "User already verified");
    return;
  }
  var user: any = await userService.verifyToken(req.user);
  await createLogService({
    logType: "USER_VERIFIED",
    userId: new ObjectId(user._id),
    description: req.user.name + " verified email",
  });
  message(res, OK, "User verified Successfully");
};

const updateUser = async (req: any, res: any) => {
  try {
    var user: any = await userService.updateUserService(req.user._id, req.body);
    delete user.password;
    await createLogService({
      logType: "USER_UPDATED",
      userId: new ObjectId(user._id),
      description: user.name + " updated profile",
    });
    message(res, OK, "User updated Successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const userProfile = async (req: any, res: any) => {
  try {
    let user: any = req.user;

    let return_object: any = {};
    return_object.user = Object.assign({}, user)["_doc"];
    return_object.user.qrText = req.user._id + "-" + user.espektroId;
    delete return_object.user.password;
    messageCustom(res, OK, "User Profile fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const updateProfilePic = async (req: any, res: any) => {
  try {
    var path = req.file["path"];
    var user: any = await userService.updateUserService(req.user._id, {
      profileImageUrl: path,
    });

    message(res, OK, "Profile picture updated successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const forgotPassword = async (req: any, res: any) => {
  try {
    if (!req.body.email)
      throw {
        statusObj: BAD_REQUEST,
        name: "Email not provided",
        type: "BAD_REQUEST",
      };
    let email = req.body.email;
    let user: any = await userService.findUserService({ email: email });
    if (!user)
      throw {
        statusObj: BAD_REQUEST,
        name: "No such user exists",
        type: "BAD_REQUEST",
      };
    let frontEndUrl: string = String(process.env.FRONTEND_HOSTED_URL);
    const reset_token = jwt.sign(
      { email: email },
      String(process.env.JWT_SECRET),
      jwt_headers
    );
    let text =
      " Click here to reset your password: " + frontEndUrl + reset_token;
    let resMail: any = await sendMail(
      email,
      "Espektro KGEC - Reset your password",
      text
    );

    if (resMail.hasError === true) throw res.error;
    await createLogService({
      logType: "EMAIL_SENT",
      userId: new ObjectId(user._id),
      description: user.name + " requested for password reset",
    });
    console.log(reset_token);

    message(res, OK, "Password reset link sent to your email");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const resetPassword = async (req: any, res: any) => {
  try {
    let resetToken: any = req.body.resetToken;
    let password: string = req.body.password;

    let decoded: any = jwt.verify(resetToken, String(process.env.JWT_SECRET));
    let user: any = await userService.findUserService({ email: decoded.email });

    if (!user)
      throw {
        statusObj: BAD_REQUEST,
        name: "No such user exists",
        type: "BAD_REQUEST",
      };

    await userService.resetPasswordService(user._id, password);
    await createLogService({
      logType: "USER_PASSWORD_RESET",
      userId: new ObjectId(user._id),
      description: user.name + " reset password",
    });

    message(res, OK, "Password reset successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

export default {
  verifyToken,
  signUp,
  login,
  sendVerificationMail,
  updateUser,
  userProfile,
  updateProfilePic,
  forgotPassword,
  resetPassword,
};
