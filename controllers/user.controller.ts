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
    return_object.user = user;
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
    let resMail: any = await sendMail(
      email,
      "Espektro KGEC - Verify your email address",
      req.headers["authorization"].split(" ")[1]
    );
    if (resMail.hasError === true) throw res.error;
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
  var user: any = await userService.verifyToken(req.user);
  await createLogService({
    logType: "USER_VERIFIED",
    userId: new ObjectId(user._id),
    description: req.user.name + " verified email",
  });
  message(res, OK, "User verified Successfully");
};

export default {
  verifyToken,
  signUp,
  login,
  sendVerificationMail,
};
