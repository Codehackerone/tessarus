import { ObjectId } from "mongodb";
import { message, messageCustom, messageError } from "../helpers/message";
import ticketService from "../services/ticket.service";
import eventService from "../services/event.service";
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

    let return_object = {
      ticket: ticket[0],
      event: event[0],
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

export default {
  getTicket,
  allTickets,
};
