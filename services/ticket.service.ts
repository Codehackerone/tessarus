import Ticket from "../models/ticket.model";

const createTicketService = async (ticketBody: any) => {
  const newTicket = new Ticket(ticketBody);
  return await newTicket.save();
};

const getTicketService = async (ticketBody: any) => {
  return await Ticket.find(ticketBody);
};

export default {
  createTicketService,
  getTicketService,
};
