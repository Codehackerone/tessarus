import { ObjectId } from "mongodb";
import { message, messageCustom, messageError } from "../helpers/message";
import ticketService from "../services/ticket.service";
import eventService from "../services/event.service";
import userService from "../services/user.service";
import getRandomId from "../helpers/randomTextGenerator";

import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
} from "../helpers/messageTypes";
import { createLogService } from "../services/log.service";

const allTickets = async (req: any, res: any) => {
  try {
    const tickets = await ticketService.getTicketService({
      userId: req.user._id,
    });

    let return_object = {
      tickets: tickets,
    };

    messageCustom(res, OK, "Tickets fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
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

    let return_object = {
      ticket: ticket[0],
      event: event[0],
      user: user[0],
    };

    messageCustom(res, OK, "Ticket fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
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
        "Ticket already checked in"
      );
      return;
    }

    let eventsPermitted = req.volunteer.events;
    let eventPermitted = (eventsPermitted as Array<ObjectId>).find(
      (event: ObjectId) => event.equals(ticket[0].eventId)
    );
    if (!eventPermitted) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not permitted to check in for this event",
        "Not Authorized"
      );
      return;
    }

    let ticketNo = getRandomId(8);
    const updatedTicket: any = await ticketService.updateTicketService(
      { _id: req.params.id },
      {
        checkedIn: true,
        ticketNumber: ticketNo,
        checkedInAt: new Date(),
      }
    );

    createLogService({
      logType: "CHECKED_IN",
      userId: updatedTicket.userId,
      volunteerId: req.volunteer._id,
      ticketId: req.params.id,
      description: `${req.volunteer.name} checked in ${updatedTicket.name} for ${updatedTicket.eventId.name} event.`,
    });
    message(res, OK, "Ticket checked in successfully");
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export default {
  getTicket,
  allTickets,
  checkIn,
};
