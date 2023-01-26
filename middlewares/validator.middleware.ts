import {
  userSignUpSchema,
  userLoginSchema,
  updateUserSchema,
} from "../helpers/schemas";
import { BAD_REQUEST } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";

export const validateSignUp = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = userSignUpSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateLogin = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateUpdateUser = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};
