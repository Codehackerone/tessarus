import mongoose from "mongoose";
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    logType: {
      type: String,
      enum: [
        "USER_SIGNUP",
        "USER_VERIFIED",
        "USER_LOGIN",
        "USER_UPDATED",
        "USER_PASSWORD_RESET",
        "EVENT_CREATED",
        "EVENT_UPDATED",
        "EVENT_DELETED",
        "EVENT_REGISTERED",
        "CHECKED_IN",
        "PAYMENT",
        "COINS_UPDATED",
        "EMAIL_SENT",
        "VOLUNTEER_CREATED",
        "VOLUNTEER_UPDATED",
        "VOLUNTEER_DELETED",
        "VOLUNTEER_LOGIN",
        "OTP_SENT",
        "OTP_VERIFIED",
        "IMAGES_UPLOADED",
      ],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: "Volunteer",
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const paymentLogSchema = new Schema({
  logType: {
    type: String,
    enum: ["COINS_ADDED", "COINS_REDEEMED", "COINS_USED"],
    required: true,
  },
  volunteerId: {
    type: Schema.Types.ObjectId,
    ref: "Volunteer",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
  },
  coins: {
    type: Number,
  },
  description: {
    type: String,
  },
});

const Log = mongoose.model("Log", logSchema);
const paymentLog = mongoose.model("PaymentLog", paymentLogSchema);

export default {
  Log,
  paymentLog,
};
