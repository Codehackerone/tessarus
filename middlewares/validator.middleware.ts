import joiSchemas from "../helpers/schemas";
import { BAD_REQUEST } from "../helpers/messageTypes";
import { messageError } from "../helpers/message";

// Export a function named 'validateSignUp' that returns a middleware function for routes.
export const validateSignUp = () => {
  return async (req: any, res: any, next: any) => {

    // Extracts schema error if exists or passes on to next middleware if no error found.
    const { error } = joiSchemas.userSignUpSchema.validate(req.body);
    if (error) {

      // If there is an error, maps error messages from each detailed issue in the schema and joins with comma.
      const msg = error.details.map((el: any) => el.message).join(",");

      // Sends BAD_REQUEST statusObj error response via messageError function
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

export const validateAddCoins = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.addCoinsSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateRegisterEvent = () => {
  return async (req: any, res: any, next: any) => {
    if (!req.body.team) {
      const { error } = joiSchemas.registerEventSchema.validate(req.body);
      if (error) {
        const msg = error.details.map((el: any) => el.message).join(",");
        messageError(res, BAD_REQUEST, msg, "ValidationError");
      } else next();
    } else {
      const { error } = joiSchemas.registerEventTeamSchema.validate(req.body);
      if (error) {
        const msg = error.details.map((el: any) => el.message).join(",");
        messageError(res, BAD_REQUEST, msg, "ValidationError");
      } else next();
    }
  };
};

export const validateOTPSchema = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.verifyOTPSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validateEventCheckIn = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.eventCheckInSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};

export const validatePrizeAddSchema = () => {
  return async (req: any, res: any, next: any) => {
    const { error } = joiSchemas.prizeAddSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el: any) => el.message).join(",");
      messageError(res, BAD_REQUEST, msg, "ValidationError");
    } else next();
  };
};
