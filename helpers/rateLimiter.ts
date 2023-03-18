import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message:
    "Too many requests from this IP, please try again after an 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiLimiter, mailLimiter };
