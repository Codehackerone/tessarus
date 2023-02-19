import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import volunteerService from "../services/volunteer.service";
import userService from "../services/user.service";
import eventService from "../services/event.service";
import { getAllLogsService } from "../services/log.service";
import { message, messageCustom } from "../helpers/message";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
} from "../helpers/messageTypes";
import getRandomId from "../helpers/randomTextGenerator";
import {
  createLogService,
  createPaymentLogService,
  getAllPaymentLogsService,
} from "../services/log.service";
import sendMail from "../helpers/sendEmail";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { addVolunteerTemplate } from "../helpers/emailTemplate";
import { handleError } from "../helpers/errorHandler";

config();

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

const addVolunteer = async (req: any, res: any) => {
  try {
    const password = getRandomId(8);

    req.body.password = password;

    if (req.body.events) {
      for (const eventId of req.body.events) {
        const event: any = await eventService.getEventService({
          _id: eventId,
        });
        if (!event) {
          const err: any = {
            statusObj: NOT_FOUND,
            type: "NotFoundError",
            name: "No event found with id: " + eventId,
          };
          throw err;
        }
      }
    }

    const volunteer: any = await volunteerService.addVolunteerService(req.body);
    const text: any = addVolunteerTemplate(
      volunteer.name,
      volunteer.email,
      password,
      req.volunteer.name,
    );

    const resMail: any = await sendMail(
      volunteer.email,
      "Espektro KGEC - Added as a volunteer!",
      text,
    );

    if (resMail.hasError === true) throw resMail.error;

    await createLogService({
      logType: "EMAIL_SENT",
      volunteerId: new ObjectId(volunteer._id),
      description: `Email sent to ${volunteer.email} with password as newly created volunteer.`,
    });

    await createLogService({
      logType: "VOLUNTEER_CREATED",
      volunteerId: new ObjectId(req.volunteer._id),
      description: `New volunteer created with email ${volunteer.email}. by ${req.volunteer.name}`,
    });

    messageCustom(res, CREATED, "Volunteer added successfully.", volunteer);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const resendCredentials = async (req: any, res: any) => {
  try {
    const volunteer: any = await volunteerService.findVolunteerService({
      _id: req.params.id,
    });
    if (!volunteer) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found with id: " + req.params.id,
      };
      throw err;
    }

    const newPassword: string = getRandomId(8);
    await volunteerService.resendCredentialsService(volunteer._id, newPassword);

    const text: any = addVolunteerTemplate(
      volunteer.name,
      volunteer.email,
      newPassword,
      req.volunteer.name,
    );

    const resMail: any = await sendMail(
      volunteer.email,
      "Espektro KGEC - Added as a volunteer (Credentials Resent)!",
      text,
    );

    if (resMail.hasError === true) throw resMail.error;

    await createLogService({
      logType: "EMAIL_SENT",
      volunteerId: new ObjectId(volunteer._id),
      description: `Email resent to ${volunteer.email} with newly created password as volunteer.`,
    });

    message(res, OK, "Credentials resent successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const login = async (req: any, res: any) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const volunteer: any = await volunteerService.findVolunteerService({
      email,
    });
    if (!volunteer) {
      const err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    if (!bcrypt.compareSync(password, volunteer.password)) {
      const err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    const access_token = jwt.sign(
      { email: volunteer.email, user_id: volunteer._id },
      String(process.env.JWT_SECRET),
      jwt_headers,
    );
    const return_object: any = {};
    return_object.auth_token = access_token;
    return_object.volunteer = Object.assign({}, volunteer)["_doc"];
    delete return_object.volunteer.password;
    await createLogService({
      logType: "VOLUNTEER_LOGIN",
      userId: new ObjectId(volunteer._id),
      description: volunteer.name + " logged in",
    });
    messageCustom(res, OK, "Successfully logged in", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getAllVolunteers = async (req: any, res: any) => {
  try {
    const volunteers: any = await volunteerService.findAllVolunteersService();

    if (volunteers.length === 0) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteers found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.volunteers = volunteers;

    messageCustom(res, OK, "Volunteers fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getVolunteer = async (req: any, res: any) => {
  try {
    const volunteerId = req.params.id;

    const volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });

    if (!volunteer) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.volunteer = Object.assign({}, volunteer)["_doc"];
    delete return_object.volunteer.password;

    messageCustom(res, OK, "Volunteer fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const updateVolunteer = async (req: any, res: any) => {
  try {
    const volunteerId = req.params.id;
    const volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });
    if (!volunteer) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    for (const eventId of req.body.events) {
      const event: any = await eventService.getEventService({
        _id: eventId,
      });
      if (!event) {
        const err: any = {
          statusObj: NOT_FOUND,
          type: "NotFoundError",
          name: "No event found with id: " + eventId,
        };
        throw err;
      }
    }

    const updatedVolunteer: any = await volunteerService.updateVolunteerService(
      volunteerId,
      req.body,
    );

    const return_object: any = {};
    return_object.volunteer = Object.assign({}, updatedVolunteer)["_doc"];
    delete return_object.volunteer.password;

    await createLogService({
      logType: "VOLUNTEER_UPDATED",
      userId: new ObjectId(req.volunteer._id),
      description:
        req.volunteer.name + " updated Volunteer " + updatedVolunteer.name,
    });

    messageCustom(res, OK, "Volunteer updated successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getAllUsers = async (req: any, res: any) => {
  try {
    const users: any = await userService.getAllUsersService();
    if (users.length === 0) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No users found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.users = users;
    messageCustom(res, OK, "Users fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getAllLogs = async (req: any, res: any) => {
  try {
    const logType = !req.query.logType ? {} : { logType: req.query.logType };
    const page = !req.query.page ? 1 : req.query.page;
    const dpp = !req.query.dpp ? 20 : req.query.dpp;

    const logs: any = await getAllLogsService(logType, page, dpp);
    if (logs.length === 0) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No logs found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.logs = logs;
    messageCustom(res, OK, "Logs fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getAllPaymentLogs = async (req: any, res: any) => {
  try {
    const logType = !req.query.logType ? {} : { logType: req.query.logType };
    const page = !req.query.page ? 1 : req.query.page;
    const dpp = !req.query.dpp ? 20 : req.query.dpp;

    const logs: any = await getAllPaymentLogsService(logType, page, dpp);
    if (logs.length === 0) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No logs found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.logs = logs;
    messageCustom(res, OK, "Logs fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const deleteVolunteer = async (req: any, res: any) => {
  try {
    const volunteerId = req.params.id;
    const volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });
    if (!volunteer) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    if (volunteer.accessLevel >= 4) {
      const err: any = {
        statusObj: FORBIDDEN,
        type: "ForbiddenError",
        name: "You are not authorized to perform this action",
      };
      throw err;
    }

    const deletedVolunteer: any = await volunteerService.deleteVolunteerService(
      volunteerId,
    );

    await createLogService({
      logType: "VOLUNTEER_DELETED",
      userId: new ObjectId(req.volunteer._id),
      description:
        req.volunteer.name + " deleted Volunteer " + deletedVolunteer.name,
    });

    message(res, OK, "Volunteer deleted successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const userQRScan = async (req: any, res: any) => {
  try {
    const qrText = req.body.qrText;
    const user: any = await userService.findUserService({
      _id: qrText.split("-")[0],
    });
    if (!user) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No user found",
      };
      throw err;
    }
    const return_object: any = {};
    return_object.user = Object.assign({}, user)["_doc"];
    delete return_object.user.password;

    messageCustom(res, OK, "User fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const addCoins = async (req: any, res: any) => {
  try {
    const userId = req.body.userId;
    const user: any = await userService.findUserService({
      _id: userId,
    });
    if (!user) {
      const err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No user found",
      };
      throw err;
    }
    const updatedUser: any = await userService.updateUserService(userId, {
      coins:
        user.coins + req.body.amount * Number(process.env.COIN_RUPEE_RATIO),
    });

    const return_object: any = {};
    return_object.user = Object.assign({}, updatedUser)["_doc"];
    delete return_object.user.password;

    await createPaymentLogService({
      logType: "COINS_ADDED",
      userId: new ObjectId(userId),
      volunteerId: new ObjectId(req.volunteer._id),
      amount: req.body.amount,
      description: `Coins added to user ${updatedUser.name} by volunteer ${req.volunteer.name}`,
    });

    message(res, OK, "Coins added to user successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

export default {
  addVolunteer,
  login,
  getAllVolunteers,
  getVolunteer,
  updateVolunteer,
  getAllUsers,
  getAllLogs,
  deleteVolunteer,
  userQRScan,
  addCoins,
  getAllPaymentLogs,
  resendCredentials,
};
