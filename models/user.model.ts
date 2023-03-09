import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    espektroId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },
    dateOfBirth: {
      type: Date,
    },
    college: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      enum: ["B.Tech", "M.Tech", "MCA", "Others"],
    },
    year: {
      type: String,
    },
    stream: {
      type: String,
    },
    coins: {
      type: Number,
      default: 0,
    },
    profileImageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dfediigxy/image/upload/v1676061086/d7f2503eaaae267553edb4fe69b476e2_ieahvh.jpg",
    },
    referralCode: {
      type: String,
      unique: true,
    },
    eventWinList: [
      {
        eventName: {
          type: String,
        },
        eventId: {
          type: Schema.Types.ObjectId,
          ref: "Event",
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

userSchema.pre("save", async function (next: any) {
  if (!this.isModified || !this.isNew) {
    next();
  } else this.isModified("password");
  if (this.password) this.password = bcrypt.hashSync(String(this.password), 12);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
