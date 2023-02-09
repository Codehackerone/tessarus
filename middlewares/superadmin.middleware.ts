import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";
import { config } from "dotenv";

config();
/*
 * @accessLevel: 1 - Volunteer
 * @accessLevel: 2 - Treasurer
 * @accessLevel: 3 - Admin
 * @accessLevel: 4 - Super Admin
 */

export const issuperadmin = () => {
  return async (req: any, res: any, next: any) => {
    if (req.body.accessLevel < 4) next();
    else if (req.headers["admin_secret"] === undefined) {
      return messageError(
        res,
        BAD_REQUEST,
        "You cant create a superadmin",
        "AuthenticationError",
      );
    } else {
      try {
        const admin_secret = req.headers["admin_secret"];

        if (admin_secret !== String(process.env.ADMIN_SECRET)) {
          return messageError(
            res,
            UNAUTHORIZED,
            "Incorrect admin secret",
            "AuthenticationError",
          );
        }
        next();
      } catch (err) {
        console.log(err);
        return messageError(
          res,
          UNAUTHORIZED,
          "Expired or invalid token",
          "AuthenticationError",
        );
      }
    }
  };
};

export default issuperadmin;
