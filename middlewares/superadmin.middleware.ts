import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { config } from "dotenv";
import { handleError } from "../helpers/errorHandler";

config();
/*
 * @accessLevel: 1 - Volunteer
 * @accessLevel: 2 - Treasurer
 * @accessLevel: 3 - Admin
 * @accessLevel: 4 - Super Admin
 */

export const issuperadmin = () => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.body.accessLevel < 4) next();
      else if (req.headers["admin_secret"] === undefined) {
        throw {
          statusObj: UNAUTHORIZED,
          name: "You cant create a superadmin",
          type: "AuthorizationError",
        };
      } else {
        try {
          const admin_secret = req.headers["admin_secret"];
          if (admin_secret !== String(process.env.ADMIN_SECRET)) {
            throw {
              statusObj: BAD_REQUEST,
              name: "Incorrect admin secret",
              type: "ValidationError",
            };
          }
          next();
        } catch (err) {
          throw {
            statusObj: BAD_REQUEST,
            name: "Expired or invalid token",
            type: "JWTError",
          };
        }
      }
    } catch (err) {
      await handleError(req, res, err);
    }
  };
};

export default issuperadmin;
