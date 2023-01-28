import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrText: {
      type: String,
      required: true,
    },
    checkedIn: {
      type: Boolean,
      default: true,
    },
    ticketNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
