import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";

const volunteerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    accessLevel: {
      type: Number,
      default: 1,
    },
    profileImageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dfediigxy/image/upload/v1674744900/Tessarus/images_cr3z7v.jpg",
    },
  },
  {
    timestamps: true,
  },
);

volunteerSchema.pre("save", async function (next: any) {
  if (!this.isModified || !this.isNew) {
    next();
  } else this.isModified("password");
  if (this.password) this.password = bcrypt.hashSync(String(this.password), 12);
  next();
});

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
