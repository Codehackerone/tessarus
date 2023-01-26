import mongoose from "mongoose";
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    logType: {
      type: String,
      enum: [
                "USER_SIGNUP", "USER_VERIFIED", "USER_LOGIN", "EVENT_CREATED",
                "EVENT_UPDATED", "EVENT_DELETED", "TICKET_CREATED", "CHECKED_IN",
                "PAYMENT", "COINS_UPDATED", "EMAIL_SENT"
            ],
      required: true,
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "User",        
    },
    volunteer_id:{
        type: Schema.Types.ObjectId,
        ref: "Volunteer",
    },
    description: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;
