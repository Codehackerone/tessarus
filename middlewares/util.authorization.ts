import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";
import { config } from "dotenv";

config();

const utilMiddleware = () => {
  return async (req: any, res: any, next: any) => {
    if (req.headers["UTILS-API-KEY"] === undefined) {
      return messageError(
        res,
        BAD_REQUEST,
        "No util api key provided",
        "AuthenticationError",
      );
    } else {
      try {
        const utilsApiKey = req.headers["UTILS-API-KEY"];

        if (utilsApiKey !== String(process.env.UTILS_API_KEY)) {
          return messageError(
            res,
            UNAUTHORIZED,
            "Invalid util api key",
            "AuthenticationError",
          );
        }
        next();
      } catch (err) {
        console.log(err);
        return messageError(
          res,
          UNAUTHORIZED,
          "Expired or invalid UTILS-API-KEY token",
          "AuthenticationError",
        );
      }
    }
  };
};

export default utilMiddleware;
