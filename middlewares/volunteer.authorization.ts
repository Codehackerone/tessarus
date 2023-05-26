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

// Export a function named 'authorize' that returns middleware function for routes.
export const authorize = (accessLevel: number) => {
  return async (req: any, res: any, next: any) => {

    // Check if an Authorization token is present in the request headers. 
    try {
      if (req.headers["authorization"] === undefined) {
        throw {
          statusObj: BAD_REQUEST,
          name: "No authorization token found",
          type: "AuthenticationError",
        };
      } 

      // If Authorization token exists,
      else {
        try {
          let decoded: any = "";

          // check for Bearer token in header and validate token using JWT.
          const authorizationHeaderArray =
            req.headers["authorization"].split(" ");
          if (authorizationHeaderArray[0] !== "Bearer") {
            throw {
              statusObj: BAD_REQUEST,
              name: "We dont accept any token other than Bearer",
              type: "ValidationError",
            };
          }

          // Extract email from decoded token payload and validate accessLevel of logged-in Volunteer.
          decoded = jwt.verify(
            authorizationHeaderArray[1],
            String(process.env.JWT_SECRET),
          );
          const volunteer: any = await volunteerService.findVolunteerService({
            email: decoded.email,
          });

          // Check if Volunteer has sufficient access level to perform requested action.
          if (volunteer.accessLevel < accessLevel) {
            throw {
              statusObj: FORBIDDEN,
              name: "Volunteer not authorized to peform this action.",
              type: "AuthorizationError",
            };
          }
          req.volunteer = volunteer;
          next();

        // Catch exceptions when token cannot be validated or expired.
        } catch (err) {
          throw {
            statusObj: UNAUTHORIZED,
            name: "Expired or invalid token",
            type: "JWTError",
          };
        }
      }

    // In case of exceptions, handleError middleware is called.  
    } catch (err) {
      await handleError(req, res, err);
    }
  };
};
