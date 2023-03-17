import Event from "../models/event.model";
import { paginate } from "../helpers/paginate";

const addEventService = async (eventBody: any) => {
  const event = new Event(eventBody);
  return event.save();
};

const getAllEventsService = async (
  query: object,
  page: number,
  dpp: number,
) => {
  return await paginate(Event, query, page, dpp, {
    startTime: 1,
  });
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

const findEventByNameService = async (name: string) => {
  return Event.find({
    title: {
      $regex: name,
      $options: "i",
    },
  });
};

export default {
  addEventService,
  getAllEventsService,
  getEventService,
  updateEventByIdService,
  deleteEventByIdService,
  findEventByNameService,
};
