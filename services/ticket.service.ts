import Ticket from "../models/ticket.model";

const createTicketService = async (ticketBody: any) => {
  const newTicket = new Ticket(ticketBody);
  return await newTicket.save();
};

const getTicketService = async (ticketBody: any) => {
  return await Ticket.find(ticketBody);
};

const updateTicketService = async (ticketId: any, ticketBody: any) => {
  return await Ticket.findOneAndUpdate({ _id: ticketId }, ticketBody, {
    new: true,
  });
};

export default {
  createTicketService,
  getTicketService,
  updateTicketService,
};
