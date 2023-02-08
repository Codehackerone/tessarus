import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
		otp_token: {
			type: String,
			required: true,
		},
		expiry: {
			type: Number,
			required: true,
		},
		attempts: {
			type: Number,
		},
		done: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);
export const OTP = mongoose.model("OTP", otpSchema);
