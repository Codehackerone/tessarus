import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import authLimiter from "./helpers/rateLimiter";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import { router } from "./router";

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
app.use("/api", authLimiter);

const logStream: any = createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "logs"),
});
app.use(morgan("combined", { stream: logStream }));

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Tessarus listening on ${PORT}. \nURL:http://localhost:${PORT}`);
});
