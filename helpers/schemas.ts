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

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
	accessLevel: Joi.number().valid(1, 2, 3, 4),
});

const updateVolunteerSchema = Joi.object({
	name: Joi.string().required().escapeHTML(),
	events: Joi.array(),
});

const addEventSchema = Joi.object({
	title: Joi.string().required().escapeHTML(),
	description: Joi.string().required().escapeHTML(),
	tagLine: Joi.string().escapeHTML(),
	startTime: Joi.date().format("YYYY-MM-DD HH:mm:ss").required(),
	endTime: Joi.date().format("YYYY-MM-DD HH:mm:ss").required(),
	eventVenue: Joi.string().required().escapeHTML(),
	eventType: Joi.string().valid("solo", "group"),
	eventMinParticipants: Joi.number(),
	eventMaxParticipants: Joi.number(),
	eventPrice: Joi.number().min(0),
	eventOrganiserClub: Joi.object({
		name: Joi.string().required().escapeHTML(),
		image: Joi.string().required().escapeHTML(),
	}),
	eventCoordinators: Joi.array().items(
		Joi.object({
			name: Joi.string().required().escapeHTML(),
			phone: Joi.string().max(10, "utf-8").required().escapeHTML(),
		}),
	),
});

const addCoinsSchema = Joi.object({
	amount: Joi.number().required(),
	userId: Joi.string().required().escapeHTML(),
});

const registerEventSchema = Joi.object({
	eventId: Joi.string().required().escapeHTML(),
	team: Joi.object(),
});

const registerEventTeamSchema = Joi.object({
	eventId: Joi.string().required().escapeHTML(),
	team: Joi.object().keys({
		name: Joi.string().required().escapeHTML(),
		members: Joi.array()
			.required()
			.items(
				Joi.object({
					espektroId: Joi.string().required().escapeHTML(),
				}),
			),
	}),
});

const verifyOTPSchema = Joi.object({
	otp: Joi.string().required().escapeHTML(),
	otp_token: Joi.string().required().escapeHTML(),
	password: Joi.string().escapeHTML(),
});

const eventCheckInSchema = Joi.object({
	eventId: Joi.string().required().escapeHTML(),
	espektroId: Joi.string().required().escapeHTML(),
	password: Joi.string().required().escapeHTML(),
});

export default {
	userSignUpSchema,
	userLoginSchema,
	updateUserSchema,
	resetPasswordSchema,
	addVolunteerSchema,
	updateVolunteerSchema,
	addEventSchema,
	addCoinsSchema,
	registerEventSchema,
	registerEventTeamSchema,
	verifyOTPSchema,
	eventCheckInSchema,
};
