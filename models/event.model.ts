import mongoose from "mongoose";
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
    },
    prizes: {
      type: String,
    },
    tagLine: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    eventVenue: {
      type: String,
      required: true,
    },
    eventImages: [
      {
        url: {
          type: String,
        },
      },
    ],
    otherPlatformUrl: {
      type: String,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["solo", "group"],
    },
    eventMinParticipants: {
      type: Number,
    },
    eventMaxParticipants: {
      type: Number,
    },
    eventPrice: {
      type: Number,
      required: true,
    },
    eventPriceForKGEC: {
      type: Number,
      default: 0,
    },
    eventClosed: {
      type: Boolean,
      default: false,
    },
    eventOrganiserClub: {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
    eventCoordinators: [
      {
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },
    sponsors: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
        },
        image: {
          type: String,
        },
      },
    ],
    eventWinList: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
        },
        userCollege: {
          type: String,
        },
        position: {
          type: Number,
        },
        prize: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
