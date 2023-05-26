import express from "express";
import volunteerController from "../controllers/volunteer.controller";
import {
  validateAddVolunteer,
  validateLogin,
  validateUpdateVolunteer,
  validateAddCoins,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/volunteer.authorization";
import { issuperadmin } from "../middlewares/superadmin.middleware";

const Router = express.Router();

// get all users
Router.route("/allusers").get(authorize(4), volunteerController.getAllUsers);

// get all logs
Router.route("/alllogs").get(authorize(4), volunteerController.getAllLogs);

// get all payment logs
Router.route("/allpaymentlogs").get(
  authorize(4),
  volunteerController.getAllPaymentLogs,
);

// get all volunteers
Router.route("/all").get(authorize(3), volunteerController.getAllVolunteers);

// add volunteer (superadmin 4)
Router.post(
  "/add",
  validateAddVolunteer(),
  authorize(4),
  issuperadmin(),
  volunteerController.addVolunteer,
);

// login for volunteer
Router.post("/login", validateLogin(), volunteerController.login);

// add coins to user (volunteer 2)
Router.post(
  "/addcoins",
  authorize(2),
  validateAddCoins(),
  volunteerController.addCoins,
);

// get user details by QR code (volunteer 1)
Router.post("/userqrscan", authorize(1), volunteerController.userQRScan);

// resend signin credentials (volunteer 4)
Router.post("/resend/:id", authorize(4), volunteerController.resendCredentials);

// get, update, delete volunteer (level 3 & 4)
Router.route("/:id")
  .get(authorize(3), volunteerController.getVolunteer)
  .put(
    authorize(4),
    validateUpdateVolunteer(),
    volunteerController.updateVolunteer,
  )
  .delete(authorize(4), volunteerController.deleteVolunteer);

export default Router;
