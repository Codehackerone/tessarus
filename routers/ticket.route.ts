import express from "express";
import ticketController from "../controllers/ticket.controller";
import { authorize as userAuthorize } from "../middlewares/user.authorization";
import { authorize as volunteerAuthorize } from "../middlewares/volunteer.authorization";

const Router = express.Router();

// get all tickets for user
Router.route("/allforusers").get(userAuthorize(), ticketController.allTickets);

// get all tickets for event (volunteer)
Router.route("/allforusers/:id").get(
  volunteerAuthorize(4),
  ticketController.allTicketsForUser,
);

// get all tickets for an event - /event/:id - GET

// get all tickets for a user - /user/:id - GET

// get all tickets for a user for an event - /user/:id/event/:id - GET

// Checkin users for an event (volunteer 1)
Router.route("/checkin/:id").post(
  volunteerAuthorize(1),
  ticketController.checkIn,
);

// get ticket
Router.route("/:id").get(ticketController.getTicket);

export default Router;
