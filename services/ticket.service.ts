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

const getParticipantsfromEventService = async (eventId: any) => {
  return await Ticket.aggregate([
    {
      $match: {
        eventId: eventId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $set: {
        userName: { $arrayElemAt: ["$user.name", 0] },
        userPhone: { $arrayElemAt: ["$user.phone", 0] },
        userEmail: { $arrayElemAt: ["$user.email", 0] },
        userCollege: { $arrayElemAt: ["$user.college", 0] },
        userYear: { $arrayElemAt: ["$user.year", 0] },
        userEspektroId: { $arrayElemAt: ["$user.espektroId", 0] },
        userId: { $arrayElemAt: ["$user._id", 0] },
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ]);
};

export default {
  createTicketService,
  getTicketService,
  updateTicketService,
  checkWhetherUserIsRegisteredInEventService,
  getAllTicketsService,
  getParticipantsfromEventService,
};
