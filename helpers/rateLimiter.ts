// Importing rateLimit middleware from the express-rate-limit package
import rateLimit from "express-rate-limit";

// Configuring rate limits on the number of requests that can be sent to two different endpoints with different windows of time and messages
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Setting a 15 minute limit
  max: 15000, // Allowing up to 10,000 requests in this time period
  message:
    "Too many requests from this IP, please try again after an 15 minutes", // Sending this error message when the limit is breached
  standardHeaders: true, // Enabling standard headers
  legacyHeaders: false, // Disabling legacy headers
  keyGenerator: (req: any) => {
    return req.clientIp;
  },
});

// for mails

const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return req.clientIp;
  },
});

// Exporting the configured rate limiters to be used by other modules
export { apiLimiter, mailLimiter };
