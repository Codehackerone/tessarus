import express from "express";
import ticketController from "../controllers/ticket.controller";
import { authorize as userAuthorize } from "../middlewares/user.authorization";

const Router = express.Router();

Router.route("/all").get(userAuthorize(), ticketController.allTickets);

// get all tickets for an event - /event/:id - GET

// get all tickets for a user - /user/:id - GET

// get all tickets for a user for an event - /user/:id/event/:id - GET

// check in for an event - /checkin - POST- minAccessLevel: 1

Router.route("/:id").get(ticketController.getTicket);

export default Router;
