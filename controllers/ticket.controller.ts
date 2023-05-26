import { ObjectId } from "mongodb";
import { message, messageCustom } from "../helpers/message";
import ticketService from "../services/ticket.service";
import eventService from "../services/event.service";
import userService from "../services/user.service";
import getRandomId from "../helpers/randomTextGenerator";
import { OK, BAD_REQUEST, FORBIDDEN } from "../helpers/messageTypes";
import { createLogService } from "../services/log.service";
import { handleError } from "../helpers/errorHandler";

// Get all tickets of a user (for users - headers)
const allTickets = async (req: any, res: any) => {
  try {
    const tickets = await ticketService.getAllTicketsService({
      userId: new ObjectId(req.user._id),
    });

    const return_object = {
      tickets: tickets,
    };

    messageCustom(res, OK, "Tickets fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// Get all tickets of a user (for volunteers/admin - headers)
const allTicketsForUser = async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      throw {
        statusObj: BAD_REQUEST,
        name: "User ID not provided",
        type: "ValidationError",
      };
    }
    const tickets = await ticketService.getTicketService({
      userId: req.params.id,
    });

    const return_object = {
      tickets: tickets,
    };

    messageCustom(res, OK, "Tickets fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// Get a ticket 
const getTicket = async (req: any, res: any) => {
  try {
    const ticket = await ticketService.getTicketService({ _id: req.params.id });
    if (ticket.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Ticket not found",
        type: "NotFoundError",
      };
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
    await handleError(req, res, err);
  }
};

// Check in a ticket for an event (for volunteers/admin)
const checkIn = async (req: any, res: any) => {
  try {
    // Check if ticket exists
    const ticket = await ticketService.getTicketService({ _id: req.params.id });
    if (ticket.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Ticket not found",
        type: "NotFoundError",
      };
    }
    if (ticket[0].checkedIn) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Ticket already checked in",
        type: "ValidationError",
      };
    }

    // Check if volunteer is permitted to check in for this event
    const eventsPermitted = req.volunteer.events;
    const eventPermitted = (eventsPermitted as Array<ObjectId>).find(
      (event: ObjectId) => event.equals(ticket[0].eventId),
    );
    if (!eventPermitted && req.volunteer.accessLevel < 4) {
      throw {
        statusObj: FORBIDDEN,
        name: "You are not permitted to check in participants for this event",
        type: "AuthorizationError",
      };
    }

    // add ticket number and checked in at
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

    createLogService({
      logType: "CHECKED_IN",
      userId: updatedTicket.userId,
      volunteerId: req.volunteer._id,
      ticketId: req.params.id,
      description: `${req.volunteer.name} checked in ${user.name} for ${event[0].title} event.`,
    });
    message(res, OK, "Ticket checked in successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

export default {
  getTicket,
  allTickets,
  checkIn,
  allTicketsForUser,
};
