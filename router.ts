import { Router, Request, Response } from "express";
import { message } from "./helpers/message";
import { OK, NOT_FOUND } from "./helpers/messageTypes";
import userRouter from "./routers/user.route";
import volunterRouter from "./routers/volunteer.route";
import eventRouter from "./routers/event.route";
import ticketRouter from "./routers/ticket.route";
import utilRouter from "./routers/util.route";

export const router = Router();

router.route("/").get((req: Request, res: Response) => {
  message(res, OK, "Welcome to tessarus API system");
});

router.use("/api/users", userRouter);
router.use("/api/volunteers", volunterRouter);
router.use("/api/events", eventRouter);
router.use("/api/tickets", ticketRouter);
router.use("/api/utils", utilRouter);

router.all("*", (req: Request, res: Response) => {
  message(res, NOT_FOUND, "Route does not exist");
});
