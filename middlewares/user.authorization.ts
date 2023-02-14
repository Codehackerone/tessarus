import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import userService from "../services/user.service";
import { messageError } from "../helpers/message";

export const authorize = (softPass = false) => {
  return async (req: any, res: any, next: any) => {
    if (req.headers["authorization"] === undefined && softPass === false) {
      return messageError(
        res,
        BAD_REQUEST,
        "No auth token found",
        "AuthenticationError",
      );
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
          return messageError(
            res,
            BAD_REQUEST,
            "We dont accept any token other than Bearer",
            "AuthenticationError",
          );
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
          return messageError(
            res,
            UNAUTHORIZED,
            "User not verified.",
            "AuthenticationError",
          );
        }
        req.user = user;
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
