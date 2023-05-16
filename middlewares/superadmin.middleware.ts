// Importing messageTypes constants for error handling and several methods from other modules
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { config } from "dotenv";
import { handleError } from "../helpers/errorHandler";

// Loading environment variables from the .env file using dotenv package
config();

/*
 * @accessLevel: 1 - Volunteer
 * @accessLevel: 2 - Treasurer
 * @accessLevel: 3 - Admin
 * @accessLevel: 4 - Super Admin
 */

// Defining a middleware function called issuperadmin that returns an async function
export const issuperadmin = () => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.body.accessLevel < 4) next(); // Checking access level
      else if (req.headers["admin_secret"] === undefined) { // Checking if an admin secret is present in headers
        throw {
          statusObj: UNAUTHORIZED,
          name: "You cant create a superadmin",
          type: "AuthorizationError",
        };
      } else { // Validating admin secret
        try {
          const admin_secret = req.headers["admin_secret"];
          if (admin_secret !== String(process.env.ADMIN_SECRET)) { // If not matched, throwing an error
            throw {
              statusObj: BAD_REQUEST,
              name: "Incorrect admin secret",
              type: "ValidationError",
            };
          }
          next(); // If matched, calling 'next()' i.e. going to the next middleware function
        } catch (err) {
          throw {
            statusObj: BAD_REQUEST,
            name: "Expired or invalid token",
            type: "JWTError", 
          };
        }
      }
    } catch (err) {
      await handleError(req, res, err); // Handling the error using the handleError method
    }
  };
};

// Exporting issuperadmin as the default middleware function
export default issuperadmin;
