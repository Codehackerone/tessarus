// Importing necessary modules and methods from other modules
import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import userService from "../services/user.service";
import { handleError } from "../helpers/errorHandler";

// Defining an authentication middleware function called 'authorize'
// softpass - allows the user to pass through the middleware without a token if set to true
export const authorize = (softPass = false) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.headers["authorization"] === undefined && softPass === false) {
        // Checking for missing authorization token
        throw {
          statusObj: BAD_REQUEST,
          name: "No authorization token found",
          type: "AuthenticationError",
        };
      } else if (
        req.headers["authorization"] === undefined &&
        softPass === true
      ) {
        // Checking for non-existent authorization token with softPass=true
        next();
      } else {
        // If an authorization token exists, verifying it
        try {
          let decoded: any = "";
          const authorizationHeaderArray =
            req.headers["authorization"].split(" ");
          if (authorizationHeaderArray[0] !== "Bearer") {
            // Checking for token type
            throw {
              statusObj: BAD_REQUEST,
              name: "We dont accept any token other than Bearer",
              type: "ValidationError",
            };
          }
          decoded = jwt.verify(
            // Verifying the token using jwt.verify method
            authorizationHeaderArray[1],
            String(process.env.JWT_SECRET),
          );
          const user: any = await userService.findUserService({
            // Fetching user details using the email id in the token
            email: decoded.email,
          });
          const urlsToSkip: Array<string> = [
            // Creating a list of URLs that don't require token verification
            "/sendmail",
            "/verifytoken",
            "/profile",
            "/update",
            "/updateprofilepic",
          ];

          if (user.verified === false && urlsToSkip.includes(req.originalUrl)) {
            // Checking user verification status and original URL
            throw {
              statusObj: UNAUTHORIZED,
              name: "User not verified",
              type: "AuthenticationError",
            };
          }
          req.user = user; // Setting 'req.user' property to user object for use in subsequent middleware functions
          next(); // Calling 'next()' i.e. going to the next middleware function
        } catch (err) {
          throw {
            statusObj: UNAUTHORIZED,
            name: "Expired or invalid token",
            type: "JWTError",
          };
        }
      }
    } catch (err) {
      await handleError(req, res, err); // Handling errors using the handleError method
    }
  };
};
