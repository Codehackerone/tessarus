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

const Joi = BaseJoi.extend(extension).extend(require("@joi/date"));

const userSignUpSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  email: Joi.string().required().escapeHTML(),
  phone: Joi.string().max(10, "utf-8").required().escapeHTML(),
  password: Joi.string().required().escapeHTML(),
  gender: Joi.string().valid("Male", "Female", "Others"),
  dateOfBirth: Joi.date().format("YYYY-MM-DD").required(),
  college: Joi.string().required().escapeHTML(),
  degree: Joi.string().valid("B.Tech", "M.Tech", "MCA"),
  year: Joi.string().valid("1", "2", "3", "4"),
  stream: Joi.string(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().required().escapeHTML(),
  password: Joi.string().required().escapeHTML(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  gender: Joi.string().valid("Male", "Female", "Others"),
  dateOfBirth: Joi.date().format("YYYY-MM-DD").required(),
  college: Joi.string().required().escapeHTML(),
  degree: Joi.string().valid("B.Tech", "M.Tech", "MCA"),
  year: Joi.string().valid("1", "2", "3", "4"),
  stream: Joi.string(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().escapeHTML(),
  resetToken: Joi.string().required().escapeHTML(),
});

const addVolunteerSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  email: Joi.string().required().escapeHTML(),
  phone: Joi.string().max(10, "utf-8").required().escapeHTML(),
  events: Joi.array(),
  accessLevel: Joi.number().valid(1, 2, 3),
});

export default {
  userSignUpSchema,
  userLoginSchema,
  updateUserSchema,
  resetPasswordSchema,
  addVolunteerSchema,
};
