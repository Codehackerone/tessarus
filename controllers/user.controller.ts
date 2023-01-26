import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
    signUpService,
  findUserService,
} from "../services/user.service";
import { message, messageCustom, messageError } from "../helpers/message";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
} from "../helpers/messageTypes";
import getRandomId from "../helpers/randomTextGenerator"

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

export const verifyToken = async (req: any, res: any) => {
  let return_object: any = {
    user: req.user,
  };
  messageCustom(res, OK, "Token verified", return_object);
};

export const signUp = async (req: any, res: any) => {
  try {
    req.body.espektroId = "E" + getRandomId(10);
    var user: any = await signUpService(req.body);    
    const access_token = jwt.sign(
      { email: user.email, user_id: user._id },
      String(process.env.JWT_SECRET),
      jwt_headers
    );
    var return_object: any = {
      user: user,
      auth_token: access_token,
    };
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

export const login = async (req: any, res: any) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    const user: any = await findUserService({ email });
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