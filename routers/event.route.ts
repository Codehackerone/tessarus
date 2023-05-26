import express from "express";
import eventController from "../controllers/event.controller";
import { authorize as volunteerAuthorize } from "../middlewares/volunteer.authorization";
import { authorize as userAuthorize } from "../middlewares/user.authorization";
import {
  validateAddEvent,
  validateRegisterEvent,
  validateEventCheckIn,
} from "../middlewares/validator.middleware";
// import multer from "multer";
// const upload = multer({ dest: "./uploads/" });

const Router = express.Router();

// all events
Router.route("/all").get(userAuthorize(true), eventController.getAllEvents);

// search events
Router.route("/search").get(eventController.searchEvents);

// add event (level 3)
Router.route("/add").post(
  volunteerAuthorize(3),
  validateAddEvent(),
  eventController.addEvent,
);

// Router.route("/images/:id")
//   .put(volunteerAuthorize(3), upload.array("images"), eventController.addImages)
//   .delete(volunteerAuthorize(3), eventController.deleteEventImages);

// register for event(user)
Router.route("/register").post(
  userAuthorize(),
  validateRegisterEvent(),
  eventController.registerEvent,
);

// checkin for individual event with password(user)
Router.route("/checkin").post(
  validateEventCheckIn(),
  eventController.eventCheckIn,
);

// get all participants from event (volunteer)
Router.route("/getparticipants/:id").get(
  volunteerAuthorize(1),
  eventController.getParticipantsfromEvent,
);

// get, update, delete event (level 3)
Router.route("/:id")
  .get(userAuthorize(true), eventController.getEvent)
  .put(volunteerAuthorize(3), validateAddEvent(), eventController.updateEvent)
  .delete(volunteerAuthorize(4), eventController.deleteEvent);

export default Router;
