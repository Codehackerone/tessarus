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
    checkedIn: {
      type: Boolean,
      default: false,
    },
    ticketNumber: {
      type: Number,
    },
    team: {
      name: {
        type: String,
      },
      members: [
        {
          name: {
            type: String,
          },
          designation: {
            type: String,
          },
          espektroId: {
            type: String,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
