import express from "express";
import volunteerController from "../controllers/volunteer.controller";
import {
  validateAddVolunteer,
  validateLogin,
  validateUpdateVolunteer,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/volunteer.authorization";
import { issuperadmin } from "../middlewares/superadmin.middleware";

const Router = express.Router();

Router.route("/allusers").get(authorize(4), volunteerController.getAllUsers);

Router.route("/alllogs").get(authorize(4), volunteerController.getAllLogs);

Router.route("/all").get(authorize(3), volunteerController.getAllVolunteers);

Router.post(
  "/add",
  validateAddVolunteer(),
  authorize(4),
  issuperadmin(),
  volunteerController.addVolunteer
);

Router.post("/login", validateLogin(), volunteerController.login);

Router.post("/userqrscan", authorize(1), volunteerController.userQRScan);

Router.route("/:id")
  .get(authorize(3), volunteerController.getVolunteer)
  .put(
    authorize(4),
    validateUpdateVolunteer(),
    volunteerController.updateVolunteer
  )
  .delete(authorize(4), volunteerController.deleteVolunteer);

export default Router;
