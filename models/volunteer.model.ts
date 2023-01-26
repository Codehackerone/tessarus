import mongoose from "mongoose";
const Schema = mongoose.Schema;

const volunteerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    userType: {
      type: String,
      enum: ["Volunteer", "Treasurer", "Admin"],
    },
  },
  {
    timestamps: true,
  }
);

const Volunteer = mongoose.model("Ticket", volunteerSchema);

export default Volunteer;
