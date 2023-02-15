import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import userService from "../services/user.service";
import { handleError } from "../helpers/errorHandler";

export const authorize = (softPass = false) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.headers["authorization"] === undefined && softPass === false) {
        throw {
          statusObj: BAD_REQUEST,
          name: "No authorization token found",
          type: "AuthenticationError",
        };
      } else if (
        req.headers["authorization"] === undefined &&
        softPass === true
      ) {
        next();
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
          const user: any = await userService.findUserService({
            email: decoded.email,
          });
          const urlsToSkip: Array<string> = [
            "/sendmail",
            "/verifytoken",
            "/profile",
            "/update",
            "/updateprofilepic",
          ];

          if (user.verified === false && urlsToSkip.includes(req.originalUrl)) {
            throw {
              statusObj: UNAUTHORIZED,
              name: "User not verified",
              type: "AuthenticationError",
            };
          }
          req.user = user;
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
