import express from "express";
import eventController from "../controllers/event.controller";
import { authorize as volunteerAuthorize } from "../middlewares/volunteer.authorization";
import { authorize as userAuthorize } from "../middlewares/user.authorization";
import {
  validateAddEvent,
  validateRegisterEvent,
  validateEventCheckIn,
} from "../middlewares/validator.middleware";
import multer from "multer";
const upload = multer({ dest: "./uploads/" });

const Router = express.Router();

Router.route("/all").get(eventController.getAllEvents);

Router.route("/add").post(
  volunteerAuthorize(3),
  validateAddEvent(),
  eventController.addEvent
);

Router.route("/images/:id")
  .put(volunteerAuthorize(3), upload.array("images"), eventController.addImages)
  .delete(volunteerAuthorize(3), eventController.deleteEventImages);

Router.route("/register").post(
  userAuthorize(),
  validateRegisterEvent(),
  eventController.registerEvent
);

Router.route("/checkin").post(
  validateEventCheckIn(),
  eventController.eventCheckIn
);

Router.route("/:id")
  .get(eventController.getEvent)
  .put(volunteerAuthorize(3), validateAddEvent(), eventController.updateEvent)
  .delete(volunteerAuthorize(4), eventController.deleteEvent);

export default Router;
