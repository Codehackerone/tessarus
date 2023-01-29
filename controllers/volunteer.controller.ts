import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import volunteerService from "../services/volunteer.service";
import userService from "../services/user.service";
import { getAllLogsService } from "../services/log.service";
import { message, messageCustom, messageError } from "../helpers/message";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
  FORBIDDEN,
} from "../helpers/messageTypes";
import getRandomId from "../helpers/randomTextGenerator";
import { createLogService } from "../services/log.service";
import sendMail from "../helpers/sendEmail";
import bcrypt from "bcryptjs";
import { NOTFOUND } from "dns";

const expiry_length = 30 * 86400;
const jwt_headers: any = {
  algorithm: "HS256",
  expiresIn: expiry_length,
};

const addVolunteer = async (req: any, res: any) => {
  try {
    let password = getRandomId(8);

    req.body.password = password;
    var volunteer: any = await volunteerService.addVolunteerService(req.body);

    let text: string =
      "Hey " +
      volunteer.name +
      "," +
      "Welcome to Espektro KGEC! We're excited to have you on board as a volunteer." +
      "Your login credentials are:Email: " +
      volunteer.email +
      "Password: " +
      password +
      " .Please login to your account and change your password." +
      "Regards, Espektro KGEC Team";

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
        console.log(err.response.data);
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

const login = async (req: any, res: any) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    const volunteer: any = await volunteerService.findVolunteerService({
      email,
    });
    if (!volunteer) {
      var err: any = {
        statusObj: BAD_REQUEST,
        type: "AuthenticationError",
        name: "Email or Password doesn't match.",
      };
      throw err;
    }
    if (!bcrypt.compareSync(password, volunteer.password)) {
      var err: any = {
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
    var return_object: any = {};
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
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllVolunteers = async (req: any, res: any) => {
  try {
    var volunteers: any = await volunteerService.findAllVolunteersService();

    if (volunteers.length === 0) {
      var err: any = {
        statusObj: NOTFOUND,
        type: "NotFoundError",
        name: "No volunteers found",
      };
      throw err;
    }
    var return_object: any = {};
    return_object.volunteers = volunteers;

    messageCustom(res, OK, "Volunteers fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getVolunteer = async (req: any, res: any) => {
  try {
    let volunteerId = req.params.id;

    var volunteer: any = await volunteerService.findVolunteerService({
      _id: volunteerId,
    });

    if (!volunteer) {
      var err: any = {
        statusObj: NOTFOUND,
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
      var err: any = {
        statusObj: NOTFOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    if (volunteer.accessLevel >= 4) {
      var err: any = {
        statusObj: FORBIDDEN,
        type: "ForbiddenError",
        name: "You are not authorized to perform this action",
      };
      throw err;
    }
    let updatedVolunteer: any = await volunteerService.updateVolunteerService(
      volunteerId,
      req.body
    );

    let return_object: any = {};
    return_object.volunteer = Object.assign({}, updatedVolunteer)["_doc"];
    delete return_object.volunteer.password;
    messageCustom(res, OK, "Volunteer updated successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllUsers = async (req: any, res: any) => {
  try {
    var users: any = await userService.getAllUsersService();
    if (users.length === 0) {
      var err: any = {
        statusObj: NOTFOUND,
        type: "NotFoundError",
        name: "No users found",
      };
      throw err;
    }
    var return_object: any = {};
    return_object.users = users;
    messageCustom(res, OK, "Users fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
      messageError(res, SERVER_ERROR, "Hold on! We are looking into it", err);
    }
  }
};

const getAllLogs = async (req: any, res: any) => {
  try {
    var logs: any = await getAllLogsService();
    if (logs.length === 0) {
      var err: any = {
        statusObj: NOTFOUND,
        type: "NotFoundError",
        name: "No logs found",
      };
      throw err;
    }
    var return_object: any = {};
    return_object.logs = logs;
    messageCustom(res, OK, "Logs fetched successfully", return_object);
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
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
      var err: any = {
        statusObj: NOTFOUND,
        type: "NotFoundError",
        name: "No volunteer found",
      };
      throw err;
    }

    if (volunteer.accessLevel >= 4) {
      var err: any = {
        statusObj: FORBIDDEN,
        type: "ForbiddenError",
        name: "You are not authorized to perform this action",
      };
      throw err;
    }

    let deletedVolunteer: any = await volunteerService.deleteVolunteerService(
      volunteerId
    );

    message(res, OK, "Volunteer deleted successfully");
  } catch (err: any) {
    if (err.statusObj !== undefined) {
      messageError(res, err.statusObj, err.name, err.type);
    } else {
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
      var err: any = {
        statusObj: NOTFOUND,
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
};
