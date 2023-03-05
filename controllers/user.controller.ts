import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import userService from "../services/user.service";
import { message, messageCustom } from "../helpers/message";
import { OK, CREATED, BAD_REQUEST, NOT_FOUND } from "../helpers/messageTypes";
import getRandomId from "../helpers/randomTextGenerator";
import {
  createLogService,
  createPaymentLogService,
} from "../services/log.service";
import sendMail from "../helpers/sendEmail";
import {
  inviteParticipantTemplate,
  registerTemplate,
} from "../helpers/emailTemplate";
import otpService from "../services/otp.service";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import eventService from "../services/event.service";
import ticketService from "../services/ticket.service";
import { handleError } from "../helpers/errorHandler";

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

const signUp = async (req: any, res: any) => {
  try {
    req.body.espektroId = "E" + getRandomId(10);
    req.body.referralCode = getRandomId(10);
    const user: any = await userService.signUpService(req.body);
    const access_token = jwt.sign(
      { email: user.email, user_id: user._id },
      String(process.env.JWT_SECRET),
      jwt_headers,
    );

    if (req.body.rcode) {
      const userReferral: any = await userService.findUserService({
        referralCode: req.body.rcode,
      });
      if (userReferral) {
        await userService.updateUserService(userReferral._id, {
          coins: userReferral.coins + Number(process.env.REFERRAL_BONUS),
        });

        await createPaymentLogService({
          logType: "COINS_ADDED",
          userId: new ObjectId(userReferral._id),
          amount: req.body.amount,
          description: `Coins added to ${userReferral.name} for referring ${user.name}`,
        });
      }
    }

    const return_object: any = {
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
      return_object,
    );
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const login = async (req: any, res: any) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user: any = await userService.findUserService({ email });
    if (!user) {
      const err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      const err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    const access_token = jwt.sign(
      { email: user.email, user_id: user._id },
      String(process.env.JWT_SECRET),
      jwt_headers,
    );
    const return_object: any = {};
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
    await handleError(req, res, err);
  }
};

const sendVerificationMail = async (req: any, res: any) => {
  try {
    const email = req.user.email;
    const frontEndUrl = String(process.env.FRONTEND_HOSTED_URL);
    const text: any =
      " Click here to verify your email: " +
      frontEndUrl +
      req.headers["authorization"].split(" ")[1];
    const resMail: any = await sendMail(
      email,
      "Espektro KGEC - Verify your email address",
      text,
    );
    if (resMail.hasError === true) throw resMail.error;
    await createLogService({
      logType: "EMAIL_SENT",
      userId: new ObjectId(req.user._id),
      description: req.user.name + " requested for email verification",
    });
    message(res, OK, "Verification code sent to your email");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const sendOTP = async (req: any, res: any) => {
  try {
    const email = req.user.email;
    const name = req.user.name;
    const otp: any = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);

    const otpResponse: any = await otpService.createAndSendOtp(
      name,
      "Espektro KGEC - OTP for your account",
      email,
      otp,
    );
    await createLogService({
      logType: "OTP_SENT",
      userId: new ObjectId(req.user._id),
      description: req.user.name + " requested for OTP",
    });

    const return_object = {
      otp: {
        otp_token: otpResponse.otp_token,
        expiry: otpResponse.expiry,
        attempts: otpResponse.attempts,
      },
    };

    messageCustom(res, OK, "OTP sent to your email", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const verifyOTPForUserVerification = async (req: any, res: any) => {
  try {
    const otp_token = req.body.otp_token;
    const otp = req.body.otp;
    const otpResponse: any = await otpService.verifyOtp(otp_token, otp);
    if (otpResponse.error === true)
      throw {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: otpResponse.message,
      };

    await createLogService({
      logType: "OTP_VERIFIED",
      userId: new ObjectId(req.user._id),
      description: req.user.name + " verified OTP",
    });

    const user: any = await userService.verifyToken(req.user);
    await createLogService({
      logType: "USER_VERIFIED",
      userId: new ObjectId(user._id),
      description: req.user.name + " verified their account",
    });

    const subject: any =
      "Espektro KGEC - Ready to get started with Espektro KGEC?";

    const resMail: any = await sendMail(
      user.email,
      subject,
      registerTemplate(user.name),
    );

    if (resMail.hasError === true) throw resMail.error;

    message(res, OK, "OTP verified successfully and user verified");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const sendOTPForReset = async (req: any, res: any) => {
  try {
    if (!req.body.email) {
      throw {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email is required",
      };
    }

    const user = await userService.findUserService({ email: req.body.email });
    if (!user) {
      throw {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "User doesn't exist",
      };
    }

    const email = req.body.email;
    const otp: any = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);

    const otpResponse: any = await otpService.createAndSendOtpForResetPassword(
      "Espekro KGEC - OTP to reset your password for your account",
      email,
      otp,
    );
    await createLogService({
      logType: "OTP_SENT",
      description: req.body.email + " requested for OTP to reset password",
    });

    const return_object = {
      otp: {
        otp_token: otpResponse.otp_token,
        expiry: otpResponse.expiry,
        attempts: otpResponse.attempts,
      },
    };

    messageCustom(res, OK, "OTP sent to your email", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const verifyOTPForResetPassword = async (req: any, res: any) => {
  try {
    const password = req.body.password;
    if (!password) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Password is required",
        type: "ValidationError",
      };
    }

    const otp_token = req.body.otp_token;
    const otp = req.body.otp;
    const otpResponse: any = await otpService.verifyOtp(otp_token, otp);
    if (otpResponse.hasError === true) throw otpResponse.error;
    const user = req.user;

    await createLogService({
      logType: "OTP_VERIFIED",
      userId: new ObjectId(req.user._id),
      description: req.user.name + " verified OTP",
    });

    await userService.resetPasswordService(user._id, password);
    await createLogService({
      logType: "USER_PASSWORD_RESET",
      userId: new ObjectId(user._id),
      description: user.name + " reset password",
    });

    message(res, OK, "Password reset successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const verifyToken = async (req: any, res: any) => {
  try {
    if (req.user.verified) {
      message(res, OK, "User already verified");
      return;
    }
    const user: any = await userService.verifyToken(req.user);
    await createLogService({
      logType: "USER_VERIFIED",
      userId: new ObjectId(user._id),
      description: req.user.name + " verified email",
    });
    message(res, OK, "User verified Successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const updateUser = async (req: any, res: any) => {
  try {
    const user: any = await userService.updateUserService(
      req.user._id,
      req.body,
    );
    delete user.password;
    await createLogService({
      logType: "USER_UPDATED",
      userId: new ObjectId(user._id),
      description: user.name + " updated profile",
    });
    message(res, OK, "User updated Successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const userProfile = async (req: any, res: any) => {
  try {
    const user: any = req.user;

    if (!user.referralCode) {
      await userService.addReferralCodeService(user._id, getRandomId(10));
    }
    const return_object: any = {};
    return_object.user = Object.assign({}, user)["_doc"];
    return_object.user.qrText = req.user._id + "-" + user.espektroId;
    delete return_object.user.password;
    messageCustom(res, OK, "User Profile fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const updateProfilePic = async (req: any, res: any) => {
  try {
    const result = await uploadFile(req.file);
    const user: any = await userService.updateUserService(req.user._id, {
      profileImageUrl: String(result.Location),
    });

    if (!user) {
      throw {
        statusObj: BAD_REQUEST,
        name: "User not found",
        type: "NotFoundError",
      };
    }

    fs.unlinkSync("./uploads/" + req.file.filename);

    await createLogService({
      logType: "USER_UPDATED",
      userId: new ObjectId(user._id),
      description: user.name + " updated profile picture",
    });

    message(res, OK, "Profile picture updated successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const forgotPassword = async (req: any, res: any) => {
  try {
    if (!req.body.email)
      throw {
        statusObj: BAD_REQUEST,
        name: "Email not provided",
        type: "ValidationError",
      };
    const email = req.body.email;
    const user: any = await userService.findUserService({ email: email });
    if (!user)
      throw {
        statusObj: BAD_REQUEST,
        name: "No such user exists",
        type: "NotFoundError",
      };
    const frontEndUrl = String(process.env.FRONTEND_HOSTED_URL);
    const reset_token = jwt.sign(
      { email: email },
      String(process.env.JWT_SECRET),
      jwt_headers,
    );
    const text =
      " Click here to reset your password: " + frontEndUrl + reset_token;
    const resMail: any = await sendMail(
      email,
      "Espektro KGEC - Reset your password",
      text,
    );

    if (resMail.hasError === true) throw res.error;
    await createLogService({
      logType: "EMAIL_SENT",
      userId: new ObjectId(user._id),
      description: user.name + " requested for password reset",
    });

    message(res, OK, "Password reset link sent to your email");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const resetPassword = async (req: any, res: any) => {
  try {
    const resetToken: any = req.body.resetToken;
    const password: string = req.body.password;

    const decoded: any = jwt.verify(resetToken, String(process.env.JWT_SECRET));
    const user: any = await userService.findUserService({
      email: decoded.email,
    });

    if (!user)
      throw {
        statusObj: BAD_REQUEST,
        name: "No such user exists",
        type: "NotFoundError",
      };

    await userService.resetPasswordService(user._id, password);
    await createLogService({
      logType: "USER_PASSWORD_RESET",
      userId: new ObjectId(user._id),
      description: user.name + " reset password",
    });

    message(res, OK, "Password reset successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const verifyEspektroId = async (req: any, res: any) => {
  try {
    const espektroId: string = req.params.id;
    const user: any = await userService.fetchEspekroIdService(espektroId);
    if (!user || user.length === 0) {
      throw {
        statusObj: NOT_FOUND,
        name: "No such user exists",
        type: "NotFoundError",
      };
    }
    if (user[0].isVerified === false) {
      throw {
        statusObj: BAD_REQUEST,
        name: "User is not verified",
        type: "ValidationError",
      };
    }

    const return_object: any = {
      user: user[0].toObject(),
    };
    return_object.user.isRegisteredInEvent = false;
    if (req.body.eventId) {
      const event: any = await eventService.getEventService({
        _id: new ObjectId(req.body.eventId),
      });
      if (!event || event.length === 0) {
        throw {
          statusObj: NOT_FOUND,
          name: "No such event exists",
          type: "NotFoundError",
        };
      }

      const tickets: any =
        await ticketService.checkWhetherUserIsRegisteredInEventService(
          espektroId,
          new ObjectId(req.body.eventId),
        );
      return_object.user.isRegisteredInEvent =
        tickets.length > 0 ? true : false;
    }

    messageCustom(res, OK, "User details", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const inviteUser = async (req: any, res: any) => {
  try {
    if (!req.body.email) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Email not provided",
        type: "ValidationError",
      };
    }
    const user: any = req.user;
    const email = req.body.email;
    const url = String(process.env.FRONTEND_HOSTED_URL);
    const referralCode = user.referralCode;

    const userExists: any = await userService.findUserService({ email: email });
    if (userExists && process.env.ENV === "prod") {
      throw {
        statusObj: BAD_REQUEST,
        name: "User already exists",
        type: "ValidationError",
      };
    }

    const text = inviteParticipantTemplate(user.name, referralCode, url);
    const resMail: any = await sendMail(
      email,
      "Espektro KGEC - Invitation",
      text,
    );

    if (resMail.hasError === true) throw res.error;

    await createLogService({
      logType: "EMAIL_SENT",
      userId: new ObjectId(user._id),
      description: user.name + " invited " + email,
    });

    message(
      res,
      OK,
      "Invitation sent successfully. You will receive " +
        process.env.REFERRAL_BONUS +
        " points on successful registration",
    );
  } catch (err) {
    await handleError(req, res, err);
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
  sendOTP,
  verifyOTPForUserVerification,
  sendOTPForReset,
  verifyOTPForResetPassword,
  verifyEspektroId,
  inviteUser,
};
