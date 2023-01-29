import joiSchemas from "../helpers/schemas";
import { BAD_REQUEST } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";

export const validateSignUp = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.userSignUpSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateLogin = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.userLoginSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateUpdateUser = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.updateUserSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateResetPassword = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.resetPasswordSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateAddVolunteer = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.addVolunteerSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateUpdateVolunteer = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.updateVolunteerSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateAddEvent = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.addEventSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};
