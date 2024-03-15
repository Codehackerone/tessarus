// Import required modules.
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import { apiLimiter } from "./helpers/rateLimiter";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import { router } from "./router";
import { deploy } from "./helpers/webhookAlert";
import requestIp from "request-ip";

// Initialize dotenv.
config();

// Create instance of Express app.
const app = express();

// Set PORT number using environment variable.
const PORT = process.env.PORT;

// Set MONGODB_URI string to the value of MONGO_URI environment variable.
const MONGODB_URI: any = String(process.env.MONGO_URI);

// Set options for connecting to MongoDB.
const connectOptions: any = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Try to connect to MongoDB with provided URI and options.
try {
  mongoose.set("strictQuery", true);
  mongoose.connect(MONGODB_URI, connectOptions);
} catch (err) {
  console.log(err);
}

// Enable CORS.
app.use(cors());

// Parse incoming JSON data.
app.use(express.json());

// Parse incoming URL encoded data.
app.use(express.urlencoded({ extended: true }));

// Apply limiter middleware to "/api" route.
app.use("/api", apiLimiter);

app.use(requestIp.mw());

// Create a rotating file stream for logging.
const logStream: any = createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "logs"),
});

// Use morgan for HTTP request logging.
app.use(morgan("combined", { stream: logStream }));

// When connection to MongoDB is opened, log it.
mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

// Apply router middleware.
app.use(router);

// Start listening on the specified port.
app.listen(PORT, () => {
  // Call deploy function for webhook deployment.
  deploy();
  console.log(`Tessarus listening on ${PORT}. \nURL:http://localhost:${PORT}`);
});
