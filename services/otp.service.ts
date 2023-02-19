import sendMail from "../helpers/sendEmail";
import { OTP } from "../models/otp.model";
import { v4 } from "uuid";
import {
  sendOTPTemplate,
  sendOTPResetPasswordTemplate,
} from "../helpers/emailTemplate";

const createAndSendOtp = async (
  name: any,
  subject: any,
  email: any,
  otp: any,
) => {
  const resMail: any = await sendMail(
    email,
    subject,
    sendOTPTemplate(name, otp),
  );

  if (resMail.hasError === true) throw resMail.error;

  const otp_token = v4();
  const response = await OTP.create({
    email: email,
    otp: otp,
    otp_token: otp_token,
    attempts: 5,
    expiry: new Date().getTime() + 2 * 60 * 1000,
  });
  return response;
};

export const verifyOtp = async (otp_token: any, otp: any) => {
  const response = await OTP.findOne({
    otp_token: otp_token,
  });
  if (!response)
    throw {
      message: "OTP Token Not Found",
      error: true,
    };
  else if (response.done === true) {
    throw {
      error: true,
      message: "OTP Already Used",
    };
  } else if (response.expiry <= new Date().getTime()) {
    throw {
      error: true,
      message: "OTP Expired",
    };
  } else if (response.attempts === 0) {
    throw {
      error: true,
      message: "OTP Attempts Exhausted",
    };
  } else if (response.otp !== otp) {
    response.attempts = (response.attempts as number) - 1;
    await response.save();
    throw {
      error: true,
      message: "OTP Incorrect",
    };
  }
  response.done = true;
  await response.save();
  return response;
};

const createAndSendOtpForResetPassword = async (
  name: any,
  subject: any,
  email: any,
  otp: any,
) => {
  const resMail: any = await sendMail(
    email,
    subject,
    sendOTPResetPasswordTemplate(name, otp),
  );

  if (resMail.hasError === true) throw resMail.error;

  const otp_token = v4();
  const response = await OTP.create({
    email: email,
    otp: otp,
    otp_token: otp_token,
    attempts: 5,
    expiry: new Date().getTime() + 2 * 60 * 1000,
  });
  return response;
};

export default {
  createAndSendOtp,
  verifyOtp,
  createAndSendOtpForResetPassword,
};
