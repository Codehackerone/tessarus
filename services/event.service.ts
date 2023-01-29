import Event from "../models/event.model";

const addEventService = async (eventBody: any) => {
  const event = new Event(eventBody);
  return event.save();
};

const getAllEventsService = async () => {
  return Event.find();
};

const getEventService = async (event: any) => {
  return Event.find(event);
};

const updateEventByIdService = async (id: string, eventBody: any) => {
  return Event.findByIdAndUpdate(id, eventBody, { new: true });
};

const deleteEventByIdService = async (id: string) => {
  return Event.findByIdAndDelete(id);
};

export default {
  addEventService,
  getAllEventsService,
  getEventService,
  updateEventByIdService,
  deleteEventByIdService,
};
