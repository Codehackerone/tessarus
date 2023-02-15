import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { config } from "dotenv";
import { handleError } from "../helpers/errorHandler";

config();

export const authorize = () => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.headers["utils-api-key"] === undefined) {
        throw {
          statusObj: BAD_REQUEST,
          name: "No UTILS-API-KEY provided",
          type: "ValidationError",
        };
      } else {
        try {
          const utilsApiKey = req.headers["utils-api-key"];

          if (utilsApiKey !== String(process.env.UTILS_API_KEY)) {
            throw {
              statusObj: BAD_REQUEST,
              name: "Incorrect UTILS-API-KEY",
              type: "ValidationError",
            };
          }
          next();
        } catch (err) {
          throw {
            statusObj: UNAUTHORIZED,
            name: "Expired or invalid token",
            type: "ValidationError",
          };
        }
      }
    } catch (err) {
      await handleError(req, res, err);
    }
  };
};
