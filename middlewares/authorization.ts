import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../helpers/messageTypes";
import userService from "../services/user.service";
import { messageError } from "../helpers/message";

export const authorize = () => {
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
        let user: any = await userService.findUserService({ email: decoded.email });
        if (
          user.verified === false &&
          req.url != "/sendmail" &&
          req.url != "/verifytoken"
        ) {
          return messageError(
            res,
            401,
            "not verified. verify first.",
            "AuthenticationError"
          );
        }
        req.user = user;
        next();
      } catch (err) {
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
