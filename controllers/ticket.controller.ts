import { ObjectId } from "mongodb";
import { message, messageCustom, messageError } from "../helpers/message";
import ticketService from "../services/ticket.service";
import eventService from "../services/event.service";
import userService from "../services/user.service";
import getRandomId from "../helpers/randomTextGenerator";
import { alert } from "../helpers/webhookAlert";

import { OK, BAD_REQUEST, SERVER_ERROR } from "../helpers/messageTypes";
import { createLogService } from "../services/log.service";

const allTickets = async (req: any, res: any) => {
  try {
    const tickets = await ticketService.getTicketService({
      userId: req.user._id,
    });

    const return_object = {
      tickets: tickets,
    };

    messageCustom(res, OK, "Tickets fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const allTicketsForUser = async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      messageError(
        res,
        BAD_REQUEST,
        "User ID not provided",
        "User ID not provided",
      );
      return;
    }
    const tickets = await ticketService.getTicketService({
      userId: req.params.id,
    });

    const return_object = {
      tickets: tickets,
    };

    messageCustom(res, OK, "Tickets fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const getTicket = async (req: any, res: any) => {
  try {
    const ticket = await ticketService.getTicketService({ _id: req.params.id });
    if (ticket.length === 0) {
      messageError(res, BAD_REQUEST, "Ticket not found", "Ticket not found");
      return;
    }

    const event: any = await eventService.getEventService({
      _id: ticket[0].eventId,
    });

    const user: any = await userService.findUserService({
      _id: ticket[0].userId,
    });

    const return_object = {
      ticket: ticket[0],
      event: event[0],
      user: user[0],
    };

    messageCustom(res, OK, "Ticket fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const checkIn = async (req: any, res: any) => {
  try {
    const ticket = await ticketService.getTicketService({ _id: req.params.id });
    if (ticket.length === 0) {
      messageError(res, BAD_REQUEST, "Ticket not found", "Ticket not found");
      return;
    }
    if (ticket[0].checkedIn) {
      messageError(
        res,
        BAD_REQUEST,
        "Ticket already checked in",
        "Ticket already checked in",
      );
      return;
    }

    const eventsPermitted = req.volunteer.events;
    const eventPermitted = (eventsPermitted as Array<ObjectId>).find(
      (event: ObjectId) => event.equals(ticket[0].eventId),
    );
    if (!eventPermitted) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not permitted to check in for this event",
        "Not Authorized",
      );
      return;
    }

    const ticketNo = getRandomId(8);
    const updatedTicket: any = await ticketService.updateTicketService(
      { _id: req.params.id },
      {
        checkedIn: true,
        ticketNumber: ticketNo,
        checkedInAt: new Date(),
      },
    );

    const user: any = await userService.findUserService({
      _id: updatedTicket.userId,
    });

    const event: any = await eventService.getEventService({
      _id: updatedTicket.eventId,
    });

    console.log(event);

    createLogService({
      logType: "CHECKED_IN",
      userId: updatedTicket.userId,
      volunteerId: req.volunteer._id,
      ticketId: req.params.id,
      description: `${req.volunteer.name} checked in ${user.name} for ${event[0].title} event.`,
    });
    message(res, OK, "Ticket checked in successfully");
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export default {
  getTicket,
  allTickets,
  checkIn,
  allTicketsForUser,
};