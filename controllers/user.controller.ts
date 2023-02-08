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
import otpService from "../services/otp.service";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import { alert } from "../helpers/webhookAlert";

const expiry_length = 30 * 86400;
const jwt_headers: any = {
	algorithm: "HS256",
	expiresIn: expiry_length,
};

const signUp = async (req: any, res: any) => {
	try {
		req.body.espektroId = "E" + getRandomId(10);
		const user: any = await userService.signUpService(req.body);
		const access_token = jwt.sign(
			{ email: user.email, user_id: user._id },
			String(process.env.JWT_SECRET),
			jwt_headers,
		);
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
					err.name,
				);
			} else {
				console.log(err);
				alert(req.originalUrl, JSON.stringify(err));
				messageError(res, SERVER_ERROR, err.message, err.name);
			}
		}
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
	}
};

const verifyOTPForUserVerification = async (req: any, res: any) => {
	try {
		const otp_token = req.body.otp_token;
		const otp = req.body.otp;
		const otpResponse: any = await otpService.verifyOtp(otp_token, otp);
		if (otpResponse.hasError === true) throw otpResponse.error;

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

		message(res, OK, "OTP verified successfully and user verified");
	} catch (err: any) {
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
	}
};

const sendOTPForReset = async (req: any, res: any) => {
	try {
		const email = req.user.email;
		const name = req.user.name;
		const otp: any = (Math.floor(Math.random() * 10000) + 10000)
			.toString()
			.substring(1);

		const otpResponse: any = await otpService.createAndSendOtpForResetPassword(
			name,
			"Espekro KGEC - OTP to reset your password for your account",
			email,
			otp,
		);
		await createLogService({
			logType: "OTP_SENT",
			userId: new ObjectId(req.user._id),
			description: req.user.name + " requested for OTP to reset password",
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
	}
};

const verifyOTPForResetPassword = async (req: any, res: any) => {
	try {
		const password = req.body.password;
		if (!password) {
			messageError(
				res,
				BAD_REQUEST,
				"New Password is required",
				"Password is required",
			);
			return;
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
	}
};

const userProfile = async (req: any, res: any) => {
	try {
		const user: any = req.user;

		const return_object: any = {};
		return_object.user = Object.assign({}, user)["_doc"];
		return_object.user.qrText = req.user._id + "-" + user.espektroId;
		delete return_object.user.password;
		messageCustom(res, OK, "User Profile fetched successfully", return_object);
	} catch (err: any) {
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
				type: "User not found",
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
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
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
		const email = req.body.email;
		const user: any = await userService.findUserService({ email: email });
		if (!user)
			throw {
				statusObj: BAD_REQUEST,
				name: "No such user exists",
				type: "BAD_REQUEST",
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
		console.log(reset_token);

		message(res, OK, "Password reset link sent to your email");
	} catch (err: any) {
		if (err.statusObj !== undefined) {
			messageError(res, err.statusObj, err.name, err.type);
		} else {
			console.log(err);
			alert(req.originalUrl, JSON.stringify(err));
			messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
		}
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
			alert(req.originalUrl, JSON.stringify(err));
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
	sendOTP,
	verifyOTPForUserVerification,
	sendOTPForReset,
	verifyOTPForResetPassword,
};
