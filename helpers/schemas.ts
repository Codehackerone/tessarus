import BaseJoi from "joi";
import sanitizeHtml from "sanitize-html";

const extension = (joi: any) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value: any, helpers: any) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

export const userSignUpSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  email: Joi.string().required().escapeHTML(),
  phone: Joi.string().required().escapeHTML(),
  password: Joi.string().required().escapeHTML(),
  gender: Joi.string().valid("Male", "Female", "Others"),
  dateOfBirth: Joi.date(),
  college: Joi.string().required().escapeHTML(),
  degree: Joi.string().valid("B.Tech", "M.Tech", "MCA"),
  year: Joi.string(),
  stream: Joi.string(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().required().escapeHTML(),  
  password: Joi.string().required().escapeHTML(),
});