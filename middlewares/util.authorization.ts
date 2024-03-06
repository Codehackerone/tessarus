import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { config } from "dotenv";
import { handleError } from "../helpers/errorHandler";

// Loads the environment variables into 'process.env'.
config();

// Export a function named 'authorize' that returns a function to be used as middleware for routes.
export const authorize = () => {
  return async (req: any, res: any, next: any) => {
    // Middleware logic for verifying UTILS-API-KEY presence and validity with appropriate statusObj error messages set in response object.
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
      // If there is any error while authorizing the request, pass it on to the 'handleError' function to handle.
      await handleError(req, res, err);
    }
  };
};
