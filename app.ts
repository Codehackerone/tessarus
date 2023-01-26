import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { message } from "./helpers/message";
import { OK, NOT_FOUND } from "./helpers/messageTypes";
import mongoose from "mongoose";
import userRouter from "./routers/user.route";

config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI: any = String(process.env.MONGO_URI);
const connectOptions: any = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

try {
  mongoose.set("strictQuery", true);
  mongoose.connect(MONGODB_URI, connectOptions);
} catch (err) {
  console.log(err);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

app.get("/", (req: any, res: any) => {
  message(res, OK, "Welcome to tessarus API system");
});

app.use("/api/users", userRouter);

app.all("*", (req: any, res: any) => {
  message(res, NOT_FOUND, "Route does not exist");
});

app.listen(PORT, () => {
  console.log(`Tessarus listening on ${PORT}. \nURL:http://localhost:${PORT}`);
});