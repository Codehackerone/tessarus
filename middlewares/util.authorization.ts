import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";
import { config } from "dotenv";

config();

export const authorize = () => {
  return async (req: any, res: any, next: any) => {
    if (req.headers["utils-api-key"] === undefined) {
      console.log(req.headers);
      return messageError(
        res,
        BAD_REQUEST,
        "No UTILS-API-KEY provided",
        "AuthenticationError",
      );
    } else {
      try {
        const utilsApiKey = req.headers["utils-api-key"];

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
