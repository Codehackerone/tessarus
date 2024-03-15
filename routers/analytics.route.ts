import express from "express";
import { authorize } from "../middlewares/volunteer.authorization";
import analyticsController from "../controllers/analytics.controller";

const Router = express.Router();

Router.route("/clubs").get(
  authorize(1),
  analyticsController.getEventOrganizerClubs,
);

Router.route("/log").get(authorize(1), analyticsController.getNumLogs);

Router.route("/user").get(authorize(1), analyticsController.getUserAnalytics);

Router.route("/event").get(authorize(1), analyticsController.getEventAnalytics);

export default Router;
