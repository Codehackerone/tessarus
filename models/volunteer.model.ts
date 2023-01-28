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
    accessLevel:{
      type: Number,
      default: 1    
    }
  },
  {
    timestamps: true,
  }
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
