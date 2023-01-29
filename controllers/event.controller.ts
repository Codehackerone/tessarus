import { ObjectId } from "mongodb";
import { message, messageCustom, messageError } from "../helpers/message";
import eventService from "../services/event.service";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
} from "../helpers/messageTypes";
import { createLogService } from "../services/log.service";

export const addEvent = async (req: any, res: any) => {
  try {
    req.body.createdBy = req.volunteer._id;

    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      messageError(
        res,
        BAD_REQUEST,
        "Start time cannot be greater than end time",
        "BAD_REQUEST"
      );
      return;
    }

    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max and min participants are required for group events",
          "BAD_REQUEST"
        );
        return;
      }

      let maxParticipants = req.body.eventMaxParticipants;
      let minParticipants = req.body.eventMinParticipants;

      if (maxParticipants <= minParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max participants cannot be less than or equal to min participants",
          "BAD_REQUEST"
        );
        return;
      }
    }

    const event: any = await eventService.addEventService(req.body);
    await createLogService({
      logType: "EVENT_CREATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event.title} created by ${req.volunteer.name}`,
    });

    let return_object: any = {
      event: event,
    };

    messageCustom(res, CREATED, "Event added successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      if (Number(err.code) === 11000) {
        messageError(
          res,
          CONFLICT,
          `${Object.keys(err.keyValue)[0]} '${
            Object.values(err.keyValue)[0]
          }' already exists.`,
          err.name
        );
      } else {
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

const getAllEvents = async (req: any, res: any) => {
  try {
    let events: any = await eventService.getAllEventsService();

    let return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Events fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const getEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    let return_object: any = {
      event: event,
    };

    messageCustom(res, OK, "Event fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export const updateEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not authorized to update this event",
        "BAD_REQUEST"
      );
      return;
    }

    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      messageError(
        res,
        BAD_REQUEST,
        "Start time cannot be greater than end time",
        "BAD_REQUEST"
      );
      return;
    }

    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max and min participants are required for group events",
          "BAD_REQUEST"
        );
        return;
      }

      let maxParticipants = req.body.eventMaxParticipants;
      let minParticipants = req.body.eventMinParticipants;

      if (maxParticipants <= minParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max participants cannot be less than or equal to min participants",
          "BAD_REQUEST"
        );
        return;
      }
    } else {
      if (req.body.eventMaxParticipants) delete req.body.eventMaxParticipants;
      if (req.body.eventMinParticipants) delete req.body.eventMinParticipants;
    }

    let updatedEvent: any = await eventService.updateEventByIdService(
      req.params.id,
      req.body
    );

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event.title} updated by ${req.volunteer.name}`,
    });

    let return_object: any = {
      event: updatedEvent,
    };

    messageCustom(res, OK, "Event updated successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      if (Number(err.code) === 11000) {
        messageError(
          res,
          CONFLICT,
          `${Object.keys(err.keyValue)[0]} '${
            Object.values(err.keyValue)[0]
          }' already exists.`,
          err.name
        );
      } else {
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

export const deleteEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not authorized to delete this event",
        "BAD_REQUEST"
      );
      return;
    }

    await eventService.deleteEventByIdService(req.params.id);

    await createLogService({
      logType: "EVENT_DELETED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event.title} deleted by ${req.volunteer.name}`,
    });

    message(res, OK, "Event deleted successfully");
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const addImages = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not authorized to add images to this event",
        "BAD_REQUEST"
      );
      return;
    }
    event = event[0];

    let imagesArray: any = event.eventImages;
    let newImages = req.files.map((f: any) => ({ url: f.path } as any));

    imagesArray = imagesArray.concat(newImages);

    let images: any = await eventService.updateEventByIdService(req.params.id, {
      eventImages: imagesArray,
    });

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Images added to event ${event.title} by ${req.volunteer.name}`,
    });

    let return_object: any = {
      images: images,
    };

    messageCustom(res, OK, "Images added successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const deleteEventImages = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      messageError(
        res,
        BAD_REQUEST,
        "You are not authorized to delete images from this event",
        "BAD_REQUEST"
      );
      return;
    }
    event = event[0];

    let imagesArray: any = event.eventImages;
    let imagesArraycopy = imagesArray;
    let imagesToDelete = req.body.images;

    imagesArray = imagesArray.filter(
      (i: any) => !imagesToDelete.includes(String(i._id))
    );

    if (imagesArray.length === imagesArraycopy.length) {
      messageError(
        res,
        BAD_REQUEST,
        "No images found to delete",
        "BAD_REQUEST"
      );
      return;
    }

    let images: any = await eventService.updateEventByIdService(req.params.id, {
      eventImages: imagesArray,
    });

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Images deleted from event ${event.title} by ${req.volunteer.name}`,
    });

    let return_object: any = {
      images: images,
    };

    messageCustom(res, OK, "Images deleted successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export default {
  addEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addImages,
  deleteEventImages,
};
