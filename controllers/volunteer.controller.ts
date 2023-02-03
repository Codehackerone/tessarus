import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import volunteerService from "../services/volunteer.service";
import userService from "../services/user.service";
import eventService from "../services/event.service";
import { getAllLogsService } from "../services/log.service";
import { message, messageCustom, messageError } from "../helpers/message";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
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

config();

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

const addVolunteer = async (req: any, res: any) => {
  try {
    let password = getRandomId(8);

    req.body.password = password;

    if (req.body.events) {
      for (let eventId of req.body.events) {
        let event: any = await eventService.getEventService({
          _id: eventId,
        });
        if (!event) {
          let err: any = {
            statusObj: NOT_FOUND,
            type: "NotFoundError",
            name: "No event found with id: " + eventId,
          };
          throw err;
        }
      }
    }

    let volunteer: any = await volunteerService.addVolunteerService(req.body);
    let text: any = addVolunteerTemplate(
      volunteer.name,
      volunteer.email,
      password,
      req.volunteer.name
    );

    let resMail: any = await sendMail(
      volunteer.email,
      "Espektro KGEC - Added as a volunteer!",
      text
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
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      if (Number(err.code) === 11000) {
        messageError(
          res,
          CONFLICT,
          `${Object.keys(err.keyValue)[0]} '${
            Object.values(err.keyValue)[0]
          }' already exists.`,
          err.name
        );
      } else {
        //console.log(err.response.data);
        console.log(err);
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

const login = async (req: any, res: any) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    const volunteer: any = await volunteerService.findVolunteerService({
      email,
    });
    if (!volunteer) {
      let err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    if (!bcrypt.compareSync(password, volunteer.password)) {
      let err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    const access_token = jwt.sign(
      { email: volunteer.email, user_id: volunteer._id },
      String(process.env.JWT_SECRET),
      jwt_headers
    );
    let return_object: any = {};
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
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllVolunteers = async (req: any, res: any) => {
  try {
    let volunteers: any = await volunteerService.findAllVolunteersService();

    if (volunteers.length === 0) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteers found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.volunteers = volunteers;

    messageCustom(res, OK, "Volunteers fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getVolunteer = async (req: any, res: any) => {
  try {
    let volunteerId = req.params.id;

    let volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });

    if (!volunteer) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.volunteer = Object.assign({}, volunteer)["_doc"];
    delete return_object.volunteer.password;

    messageCustom(res, OK, "Volunteer fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const updateVolunteer = async (req: any, res: any) => {
  try {
    let volunteerId = req.params.id;
    let volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });
    if (!volunteer) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    for (let eventId of req.body.events) {
      let event: any = await eventService.getEventService({
        _id: eventId,
      });
      if (!event) {
        let err: any = {
          statusObj: NOT_FOUND,
          type: "NotFoundError",
          name: "No event found with id: " + eventId,
        };
        throw err;
      }
    }

    let updatedVolunteer: any = await volunteerService.updateVolunteerService(
      volunteerId,
      req.body
    );

    let return_object: any = {};
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
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllUsers = async (req: any, res: any) => {
  try {
    let users: any = await userService.getAllUsersService();
    if (users.length === 0) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No users found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.users = users;
    messageCustom(res, OK, "Users fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllLogs = async (req: any, res: any) => {
  try {
    let logs: any = await getAllLogsService();
    if (logs.length === 0) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No logs found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.logs = logs;
    messageCustom(res, OK, "Logs fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllPaymentLogs = async (req: any, res: any) => {
  try {
    let logs: any = await getAllPaymentLogsService();
    if (logs.length === 0) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No logs found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.logs = logs;
    messageCustom(res, OK, "Logs fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const deleteVolunteer = async (req: any, res: any) => {
  try {
    let volunteerId = req.params.id;
    let volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });
    if (!volunteer) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    if (volunteer.accessLevel >= 4) {
      let err: any = {
        statusObj: FORBIDDEN,
        type: "ForbiddenError",
        name: "You are not authorized to perform this action",
      };
      throw err;
    }

    let deletedVolunteer: any = await volunteerService.deleteVolunteerService(
      volunteerId
    );

    await createLogService({
      logType: "VOLUNTEER_DELETED",
      userId: new ObjectId(req.volunteer._id),
      description:
        req.volunteer.name + " deleted Volunteer " + deletedVolunteer.name,
    });

    message(res, OK, "Volunteer deleted successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const userQRScan = async (req: any, res: any) => {
  try {
    let qrText = req.body.qrText;
    let user: any = await userService.findUserService({
      _id: qrText.split("-")[0],
    });
    if (!user) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No user found",
      };
      throw err;
    }
    let return_object: any = {};
    return_object.user = Object.assign({}, user)["_doc"];
    delete return_object.user.password;

    messageCustom(res, OK, "User fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const addCoins = async (req: any, res: any) => {
  try {
    let userId = req.body.userId;
    let user: any = await userService.findUserService({
      _id: userId,
    });
    if (!user) {
      let err: any = {
        statusObj: NOT_FOUND,
        type: "NotFoundError",
        name: "No user found",
      };
      throw err;
    }
    let updatedUser: any = await userService.updateUserService(userId, {
      coins:
        user.coins + req.body.amount * Number(process.env.COIN_RUPEE_RATIO),
    });

    let return_object: any = {};
    return_object.user = Object.assign({}, updatedUser)["_doc"];
    delete return_object.user.password;

    await createPaymentLogService({
      logType: "COINS_ADDED",
      userId: new ObjectId(userId),
      volunteerId: new ObjectId(req.volunteer._id),
      amount: req.body.amount,
    });

    message(res, OK, "Coins added to user successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      console.log(err);
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
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
};
