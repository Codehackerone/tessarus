import { ObjectId } from "mongodb";
import { message, messageCustom, messageError } from "../helpers/message";
import eventService from "../services/event.service";
import userService from "../services/user.service";
import ticketService from "../services/ticket.service";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  CONFLICT,
  SERVER_ERROR,
} from "../helpers/messageTypes";
import {
  createLogService,
  createPaymentLogService,
} from "../services/log.service";
import moment from "moment";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import { alert } from "../helpers/webhookAlert";

moment.suppressDeprecationWarnings = true;

const addEvent = async (req: any, res: any) => {
  try {
    req.body.createdBy = req.volunteer._id;

    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      messageError(
        res,
        BAD_REQUEST,
        "Start time cannot be greater than end time",
        "BAD_REQUEST",
      );
      return;
    }

    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max and min participants are required for group events",
          "BAD_REQUEST",
        );
        return;
      }

      const maxParticipants = req.body.eventMaxParticipants;
      const minParticipants = req.body.eventMinParticipants;

      if (maxParticipants <= minParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max participants cannot be less than or equal to min participants",
          "BAD_REQUEST",
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

    const return_object: any = {
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
          err.name,
        );
      } else {
        console.log(err);
        alert(req.originalUrl, JSON.stringify(err));
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

const getAllEvents = async (req: any, res: any) => {
  try {
    const page = !req.query.page ? 1 : req.query.page;
    const dpp = !req.query.dpp ? 20 : req.query.dpp;

    const searchParams = req.query;
    if (searchParams.page) delete searchParams.page;
    if (searchParams.dpp) delete searchParams.dpp;

    // eslint-disable-next-line prefer-const
    let events: any = await eventService.getAllEventsService(
      searchParams,
      page,
      dpp,
    );

    if (req.user) {
      const newEventDocs: any = [];

      const tickets: any = await ticketService.getTicketService({
        userId: new ObjectId(req.user._id),
      });
      const eventTicketDict: any = {};
      for (const ticket of tickets) {
        eventTicketDict[ticket.eventId] = ticket;
      }

      for (let event of events.documents) {
        event = event.toObject();
        if (eventTicketDict[event._id]) {
          event.isRegistered = true;
          event.ticketId = eventTicketDict[event._id]._id;
          newEventDocs.push(event);
        } else {
          event.isRegistered = false;
          newEventDocs.push(event);
        }
      }

      events.documents = newEventDocs;
    }

    const return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Events fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const searchEvents = async (req: any, res: any) => {
  try {
    const events: any = await eventService.findEventByNameService(req.query.q);

    const return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Events fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
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

    if (req.user) {
      const tickets: any = await ticketService.getTicketService({
        userId: new ObjectId(req.user._id),
      });
      const eventTicketDict: any = {};
      for (const ticket of tickets) {
        eventTicketDict[ticket.eventId] = ticket;
      }

      event = event[0].toObject();
      if (eventTicketDict[event._id]) {
        event.isRegistered = true;
        event.ticketId = eventTicketDict[event._id]._id;
      } else {
        event.isRegistered = false;
      }
    }

    const return_object: any = {
      event: event,
    };

    messageCustom(res, OK, "Event fetched successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export const updateEvent = async (req: any, res: any) => {
  try {
    const event: any = await eventService.getEventService({
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
        "BAD_REQUEST",
      );
      return;
    }

    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      messageError(
        res,
        BAD_REQUEST,
        "Start time cannot be greater than end time",
        "BAD_REQUEST",
      );
      return;
    }

    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max and min participants are required for group events",
          "BAD_REQUEST",
        );
        return;
      }

      const maxParticipants = req.body.eventMaxParticipants;
      const minParticipants = req.body.eventMinParticipants;

      if (maxParticipants <= minParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Max participants cannot be less than or equal to min participants",
          "BAD_REQUEST",
        );
        return;
      }
    } else {
      if (req.body.eventMaxParticipants) delete req.body.eventMaxParticipants;
      if (req.body.eventMinParticipants) delete req.body.eventMinParticipants;
    }

    const updatedEvent: any = await eventService.updateEventByIdService(
      req.params.id,
      req.body,
    );

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event.title} updated by ${req.volunteer.name}`,
    });

    const return_object: any = {
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
          err.name,
        );
      } else {
        console.log(err);
        alert(req.originalUrl, JSON.stringify(err));
        messageError(res, SERVER_ERROR, err.message, err.name);
      }
    }
  }
};

export const deleteEvent = async (req: any, res: any) => {
  try {
    if (process.env.ENV === "prod") {
      messageError(
        res,
        BAD_REQUEST,
        "You cannot delete a live event. Please contact admins.",
        "BAD_REQUEST",
      );
      return;
    }

    const event: any = await eventService.getEventService({
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
        "BAD_REQUEST",
      );
      return;
    }

    const tickets: any = await ticketService.getTicketService({
      eventId: req.params.id,
    });

    if (tickets.length > 0) {
      messageError(
        res,
        BAD_REQUEST,
        "You cannot delete a prebooked event",
        "BAD_REQUEST",
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
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
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
        "BAD_REQUEST",
      );
      return;
    }
    event = event[0];

    const imagesArray: any = event.eventImages;

    for (const file of req.files) {
      const result = await uploadFile(file);
      imagesArray.push({
        url: result.Location,
      });
      fs.unlinkSync("./uploads/" + file.filename);
    }

    const images: any = await eventService.updateEventByIdService(
      req.params.id,
      {
        eventImages: imagesArray,
      },
    );

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Images added to event ${event.title} by ${req.volunteer.name}`,
    });

    const return_object: any = {
      images: images,
    };

    messageCustom(res, OK, "Images added successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
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
        "BAD_REQUEST",
      );
      return;
    }
    event = event[0];

    let imagesArray: any = event.eventImages;
    const imagesArraycopy = imagesArray;
    const imagesToDelete = req.body.images;

    imagesArray = imagesArray.filter(
      (i: any) => !imagesToDelete.includes(String(i._id)),
    );

    if (imagesArray.length === imagesArraycopy.length) {
      messageError(
        res,
        BAD_REQUEST,
        "No images found to delete",
        "BAD_REQUEST",
      );
      return;
    }

    const images: any = await eventService.updateEventByIdService(
      req.params.id,
      {
        eventImages: imagesArray,
      },
    );

    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Images deleted from event ${event.title} by ${req.volunteer.name}`,
    });

    const return_object: any = {
      images: images,
    };

    messageCustom(res, OK, "Images deleted successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const registerEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.body.eventId,
    });

    if (event.length === 0) {
      messageError(res, BAD_REQUEST, "Event not found", "BAD_REQUEST");
      return;
    }

    event = event[0];

    // check event already registered
    const alreadyRegistered = await ticketService.getTicketService({
      eventId: new ObjectId(req.body.eventId),
      userId: new ObjectId(req.user._id),
    });

    if (alreadyRegistered.length > 0) {
      messageError(
        res,
        BAD_REQUEST,
        "You have already registered for this event",
        "BAD_REQUEST",
      );
      return;
    }

    if (
      new Date(event.startTime) <
      new Date(moment("YYYY-MM-DD HH:mm:ss").format())
    ) {
      messageError(
        res,
        BAD_REQUEST,
        "Event has already started",
        "BAD_REQUEST",
      );
      return;
    }

    if (event.eventType === "group") {
      const teamMembersArray: any = [];
      teamMembersArray.push({
        name: req.user.name,
        espektroId: req.user.espektroId,
        designation: "Team Leader",
      });

      if (!req.body.team) {
        messageError(
          res,
          BAD_REQUEST,
          "This is a team event. Team is required",
          "BAD_REQUEST",
        );
        return;
      }

      if (req.body.team.members.length + 1 > event.eventMaxParticipants) {
        messageError(res, BAD_REQUEST, "Team size exceeded", "BAD_REQUEST");
        return;
      }
      if (req.body.team.members.length + 1 < event.eventMinParticipants) {
        messageError(
          res,
          BAD_REQUEST,
          "Team size is less than minimum",
          "BAD_REQUEST",
        );
        return;
      }

      for (const teamMember of req.body.team.members) {
        const user: any = await userService.findUserService({
          espektroId: teamMember.espektroId,
        });
        if (!user || user.length === 0) {
          messageError(
            res,
            BAD_REQUEST,
            "User of Espektro ID " + teamMember.espektroId + "not found",
            "BAD_REQUEST",
          );
          return;
        }
        teamMembersArray.push({
          name: user.name,
          espektroId: user.espektroId,
          designation: "Team Member",
        });
      }

      req.body.team.members = teamMembersArray;
    }

    if (event.eventPrice > 0 && req.user.coins < event.eventPrice) {
      messageError(
        res,
        BAD_REQUEST,
        "Insufficient coins. Please recharge",
        "BAD_REQUEST",
      );
      return;
    }
    req.body.userId = req.user._id;
    const ticket: any = await ticketService.createTicketService(req.body);

    const return_object: any = {
      ticket: ticket,
    };

    await userService.updateUserService(req.user._id, {
      coins: req.user.coins - event.eventPrice,
    });

    await createPaymentLogService({
      logType: "COINS_USED",
      userId: new ObjectId(req.user._id),
      coins: event.eventPrice,
      description: `${req.user.name} used ${event.eventPrice} coins to register for event ${event.title}`,
    });

    await createLogService({
      logType: "EVENT_REGISTERED",
      userId: new ObjectId(req.user._id),
      description: `${req.user.name} registered for event ${event.title}`,
    });

    messageCustom(res, OK, "Event registered successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

const eventCheckIn = async (req: any, res: any) => {
  try {
    const user: any = await userService.findUserService({
      espektroId: req.body.espektroId,
    });

    if (!user || user.length === 0) {
      messageError(
        res,
        BAD_REQUEST,
        "User of Espektro ID " + req.body.espektroId + " not found",
        "BAD_REQUEST",
      );
      return;
    }

    let ticket: any = await ticketService.getTicketService({
      eventId: new ObjectId(req.body.eventId),
      userId: new ObjectId(user._id),
    });

    if (ticket.length === 0) {
      messageError(
        res,
        BAD_REQUEST,
        "User of Espektro ID " +
          req.body.espektroId +
          " is not registered for this event",
        "BAD_REQUEST",
      );
      return;
    }

    ticket = ticket[0];

    if (!ticket.checkedIn) {
      messageError(
        res,
        BAD_REQUEST,
        "User of Espektro ID " +
          req.body.espektroId +
          " still not checked in for this event",
        "BAD_REQUEST",
      );
      return;
    }

    if (String(req.body.password) !== String(ticket.ticketNumber)) {
      messageError(res, BAD_REQUEST, "Invalid password", "BAD_REQUEST");
      return;
    }

    const return_object: any = {
      ticket: ticket,
    };

    return_object.user = Object.assign({}, user)["_doc"];
    delete return_object.user.password;

    messageCustom(res, OK, "User logged in successfully", return_object);
  } catch (err: any) {
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
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
  registerEvent,
  eventCheckIn,
  searchEvents,
};
