import express from "express";
import volunteerController from "../controllers/volunteer.controller";

const Router = express.Router();

// register for an event - /register - POST

// get all tickets - /all - GET

// get all tickets for an event - /event/:id - GET

// get all tickets for a user - /user/:id - GET

// get all tickets for a user for an event - /user/:id/event/:id - GET

// check in for an event - /checkin - POST- minAccessLevel: 1

export default Router;
