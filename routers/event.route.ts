import express from "express";
import eventController from "../controllers/event.controller";
import { authorize } from "../middlewares/volunteer.authorization";
import { validateAddEvent } from "../middlewares/validator.middleware";
import multer from "multer";
import { storage } from "../helpers/cloudinary";
const upload = multer({ storage });

const Router = express.Router();

Router.route("/all").get(eventController.getAllEvents);

Router.route("/add").post(
  authorize(3),
  validateAddEvent(),
  eventController.addEvent
);

Router.route("/images/:id")
  .put(authorize(3), upload.array("images"), eventController.addImages)
  .delete(authorize(3), eventController.deleteEventImages);

Router.route("/:id")
  .get(eventController.getEvent)
  .put(authorize(3), validateAddEvent(), eventController.updateEvent)
  .delete(authorize(3), eventController.deleteEvent);

export default Router;
