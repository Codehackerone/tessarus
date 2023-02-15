import Ticket from "../models/ticket.model";

const createTicketService = async (ticketBody: any) => {
  const newTicket = new Ticket(ticketBody);
  return await newTicket.save();
};

const getTicketService = async (ticketBody: any) => {
  return await Ticket.find(ticketBody);
};

const getAllTicketsService = async (ticketBody: any) => {
  return await Ticket.aggregate([
    {
      $match: {
        ...ticketBody,
      },
    },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
  ]);
};

const updateTicketService = async (ticketId: any, ticketBody: any) => {
  return await Ticket.findOneAndUpdate({ _id: ticketId }, ticketBody, {
    new: true,
  });
};

const checkWhetherUserIsRegisteredInEventService = async (
  espektroId: any,
  eventId: any,
) => {
  return await Ticket.find({
    "team.members.espektroId": espektroId,
    eventId: eventId,
  });
};

export default {
  createTicketService,
  getTicketService,
  updateTicketService,
  checkWhetherUserIsRegisteredInEventService,
  getAllTicketsService,
};
