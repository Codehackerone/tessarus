import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import volunteerService from "../services/volunteer.service";
import { messageError } from "../helpers/message";

/*
 * @accessLevel: 1 - Volunteer
 * @accessLevel: 2 - Treasurer
 * @accessLevel: 3 - Admin
 * @accessLevel: 4 - Super Admin
 */

export const authorize = (accessLevel: number) => {
  return async (req: any, res: any, next: any) => {
    if (req.headers["authorization"] === undefined) {
      return messageError(
        res,
        BAD_REQUEST,
        "No auth token found",
        "AuthenticationError"
      );
    } else {
      try {
        let decoded: any = "";
        let authorizationHeaderArray = req.headers["authorization"].split(" ");
        if (authorizationHeaderArray[0] !== "Bearer") {
          return messageError(
            res,
            BAD_REQUEST,
            "We dont accept any token other than Bearer",
            "AuthenticationError"
          );
        }
        decoded = jwt.verify(
          authorizationHeaderArray[1],
          String(process.env.JWT_SECRET)
        );
        let volunteer: any = await volunteerService.findVolunteerService({
          email: decoded.email,
        });
        if (volunteer.accessLevel < accessLevel) {
          return messageError(
            res,
            UNAUTHORIZED,
            "Volunteer not authorized.",
            "AuthorizationError"
          );
        }
        req.volunteer = volunteer;
        next();
      } catch (err) {
        console.log(err);
        return messageError(
          res,
          UNAUTHORIZED,
          "Expired or invalid token",
          "AuthenticationError"
        );
      }
    }
  };
};
