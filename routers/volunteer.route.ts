import express from "express";
import volunteerController from "../controllers/volunteer.controller";
import {
  validateAddVolunteer,
  validateLogin,
} from "../middlewares/validator.middleware";
import { authorize } from "../middlewares/volunteer.authorization";
import { issuperadmin } from "../middlewares/superadmin.middleware";

const Router = express.Router();

// Get all users - /allusers - GET (minAccessLevel: 4)

// Get all logs - /alllogs - GET (minAccessLevel: 4)

Router.route("/all").get(authorize(3), volunteerController.getAllVolunteers);

Router.post(
  "/add",
  validateAddVolunteer(),
  authorize(4),
  issuperadmin(),
  volunteerController.addVolunteer
);

Router.post("/login", validateLogin(), volunteerController.login);

// Update volunteer - /update - PUT (minAccessLevel: 4)

// Delete volunteer - /delete - DELETE (minAccessLevel: 4)

// Scan user qr - /userqrscan - GET (minAccessLevel: 1)

Router.route("/:id").get(authorize(3), volunteerController.getVolunteer);

export default Router;
