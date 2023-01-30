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
        "TICKET_CREATED",
        "CHECKED_IN",
        "PAYMENT",
        "COINS_UPDATED",
        "EMAIL_SENT",
        "VOLUNTEER_CREATED",
        "VOLUNTEER_UPDATED",
        "VOLUNTEER_LOGIN",
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
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const paymentLogSchema = new Schema({
  volunteerId: {
    type: Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
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
