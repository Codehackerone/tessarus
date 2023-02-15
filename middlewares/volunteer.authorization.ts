import jwt from "jsonwebtoken";
import { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } from "../helpers/messageTypes";
import volunteerService from "../services/volunteer.service";
import { handleError } from "../helpers/errorHandler";

/*
 * @accessLevel: 1 - Volunteer
 * @accessLevel: 2 - Treasurer
 * @accessLevel: 3 - Admin
 * @accessLevel: 4 - Super Admin
 */

export const authorize = (accessLevel: number) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.headers["authorization"] === undefined) {
        throw {
          statusObj: BAD_REQUEST,
          name: "No authorization token found",
          type: "AuthenticationError",
        };
      } else {
        try {
          let decoded: any = "";
          const authorizationHeaderArray =
            req.headers["authorization"].split(" ");
          if (authorizationHeaderArray[0] !== "Bearer") {
            throw {
              statusObj: BAD_REQUEST,
              name: "We dont accept any token other than Bearer",
              type: "ValidationError",
            };
          }
          decoded = jwt.verify(
            authorizationHeaderArray[1],
            String(process.env.JWT_SECRET),
          );
          const volunteer: any = await volunteerService.findVolunteerService({
            email: decoded.email,
          });
          if (volunteer.accessLevel < accessLevel) {
            throw {
              statusObj: FORBIDDEN,
              name: "Volunteer not authorized to peform this action.",
              type: "AuthorizationError",
            };
          }
          req.volunteer = volunteer;
          next();
        } catch (err) {
          throw {
            statusObj: UNAUTHORIZED,
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
