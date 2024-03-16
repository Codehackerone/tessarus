import { ObjectId } from "mongodb";
import { message, messageCustom } from "../helpers/message";
import eventService from "../services/event.service";
import userService from "../services/user.service";
import ticketService from "../services/ticket.service";
import { OK, CREATED, BAD_REQUEST, FORBIDDEN } from "../helpers/messageTypes";
import {
  createLogService,
  createPaymentLogService,
} from "../services/log.service";
import moment from "moment";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import { handleError } from "../helpers/errorHandler";

moment.suppressDeprecationWarnings = true; // To remove moment deprecation warnings

// add an event
const addEvent = async (req: any, res: any) => {
  try {
    req.body.createdBy = req.volunteer._id;
    // converting event price to coins
    req.body.eventPrice = Number(
      req.body.eventPrice * Number(process.env.COIN_RUPEE_RATIO),
    );
    req.body.eventPriceForKGEC = Number(
      req.body.eventPriceForKGEC * Number(process.env.COIN_RUPEE_RATIO),
    );

    // basic time validation
    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Start time cannot be greater than end time",
        type: "ValidationError",
      };
    }

    // basic team validation
    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Max and min participants are required for group events",
          type: "ValidationError",
        };
      }

      const maxParticipants = req.body.eventMaxParticipants;
      const minParticipants = req.body.eventMinParticipants;

      // checking if max participants is greater than min participants
      if (maxParticipants <= minParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Max participants cannot be less than or equal to min participants",
          type: "ValidationError",
        };
      }
    }

    // creating event
    const event: any = await eventService.addEventService(req.body);
    // creating log
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
    await handleError(req, res, err);
  }
};

// get all events, if user is logged in, add isRegistered and ticketId to event object
const getAllEvents = async (req: any, res: any) => {
  try {
    // pagination and search params
    const page = !req.query.page ? 1 : req.query.page; // page number
    const dpp = !req.query.dpp ? 200 : req.query.dpp; // documents per page

    const searchParams = req.query;
    // removing pagination and dpp params from searchParams
    if (searchParams.page) delete searchParams.page;
    if (searchParams.dpp) delete searchParams.dpp;

    // eslint-disable-next-line prefer-const
    let events: any = await eventService.getAllEventsService(
      searchParams,
      page,
      dpp,
    );

    // if user is logged in, add isRegistered and ticketId to event object
    if (req.user) {
      const newEventDocs: any = [];

      // getting all tickets of user
      const tickets: any = await ticketService.getTicketService({
        userId: new ObjectId(req.user._id),
      });
      const eventTicketDict: any = {};
      // creating a dictionary of event id and ticket object
      for (const ticket of tickets) {
        eventTicketDict[ticket.eventId] = ticket;
      }

      // adding isRegistered and ticketId to event object
      if (events.documents) {
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
      }
      events.documents = newEventDocs;
    }

    const return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Events fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// search events
const searchEvents = async (req: any, res: any) => {
  try {
    const events: any = await eventService.findEventByNameService(req.query.q);

    const return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Events fetched successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    event = event[0].toObject();

    // if user is logged in, add isRegistered and ticketId to event object
    if (req.user) {
      const tickets: any = await ticketService.getTicketService({
        userId: new ObjectId(req.user._id),
      });
      const eventTicketDict: any = {};
      for (const ticket of tickets) {
        eventTicketDict[ticket.eventId] = ticket;
      }

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
    await handleError(req, res, err);
  }
};

// update event
export const updateEvent = async (req: any, res: any) => {
  try {
    const event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    // converting event price to coins
    req.body.eventPrice = Number(
      req.body.eventPrice * Number(process.env.COIN_RUPEE_RATIO),
    );
    req.body.eventPriceForKGEC = Number(
      req.body.eventPriceForKGEC * Number(process.env.COIN_RUPEE_RATIO),
    );

    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    // checking if user is authorized to update event
    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      throw {
        statusObj: FORBIDDEN,
        name: "You are not authorized to update this event",
        type: "AuthorizationError",
      };
    }

    // checking if event is already started
    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Start time cannot be greater than end time",
        type: "ValidationError",
      };
    }

    // checking if event is group event
    if (req.body.eventType === "group") {
      if (!req.body.eventMaxParticipants || !req.body.eventMinParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Max and min participants are required for group events",
          type: "ValidationError",
        };
      }

      const maxParticipants = req.body.eventMaxParticipants;
      const minParticipants = req.body.eventMinParticipants;

      // checking if max participants is less than or equal to min participants
      if (maxParticipants <= minParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Max participants cannot be less than or equal to min participants",
          type: "ValidationError",
        };
      }
    } else {
      if (req.body.eventMaxParticipants) delete req.body.eventMaxParticipants;
      if (req.body.eventMinParticipants) delete req.body.eventMinParticipants;
    }

    const updatedEvent: any = await eventService.updateEventByIdService(
      req.params.id,
      req.body,
    );

    // creating log
    await createLogService({
      logType: "EVENT_UPDATED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event[0].title} updated by ${req.volunteer.name}`,
    });

    const return_object: any = {
      event: updatedEvent,
    };

    messageCustom(res, OK, "Event updated successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// delete event (not allowed in production)
export const deleteEvent = async (req: any, res: any) => {
  // delete event
  try {
    // checking if environment is production and throwing error if it is
    if (process.env.ENV === "prod") {
      throw {
        statusObj: FORBIDDEN,
        name: "You cannot delete a live event. Please contact admins.",
        type: "AuthorizationError",
      };
    }

    const event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    // checking if user is authorized to delete event
    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      throw {
        statusObj: FORBIDDEN,
        name: "You are not authorized to delete this event",
        type: "AuthorizationError",
      };
    }

    // checking if users have already registered for the event
    const tickets: any = await ticketService.getTicketService({
      eventId: req.params.id,
    });

    if (tickets.length > 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "You cannot delete a prebooked event",
        type: "ValidationError",
      };
    }

    await eventService.deleteEventByIdService(req.params.id);

    // creating log
    await createLogService({
      logType: "EVENT_DELETED",
      volunteer: new ObjectId(req.volunteer._id),
      description: `Event ${event.title} deleted by ${req.volunteer.name}`,
    });

    message(res, OK, "Event deleted successfully");
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// add images to event - deprecated(cloudinary)
const addImages = async (req: any, res: any) => {
  /// add images to event
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    // checking if user is authorized to add images to event
    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      throw {
        statusObj: FORBIDDEN,
        name: "You are not authorized to add images to this event",
        type: "AuthorizationError",
      };
    }
    event = event[0];

    //
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
    await handleError(req, res, err);
  }
};

// delete images from event - deprecated(cloudinary)
const deleteEventImages = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.params.id,
    });

    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    if (
      req.volunteer.accessLevel <= 3 &&
      event[0].createdBy.toString() !== req.volunteer._id.toString()
    ) {
      throw {
        statusObj: FORBIDDEN,
        name: "You are not authorized to delete images from this event",
        type: "AuthorizationError",
      };
    }
    event = event[0];

    let imagesArray: any = event.eventImages;
    const imagesArraycopy = imagesArray;
    const imagesToDelete = req.body.images;

    imagesArray = imagesArray.filter(
      (i: any) => !imagesToDelete.includes(String(i._id)),
    );

    if (imagesArray.length === imagesArraycopy.length) {
      throw {
        statusObj: BAD_REQUEST,
        name: "No images found to delete",
        type: "ValidationError",
      };
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
    await handleError(req, res, err);
  }
};

// user register to event
const registerEvent = async (req: any, res: any) => {
  try {
    let event: any = await eventService.getEventService({
      _id: req.body.eventId,
    });

    // check event exists
    if (event.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event not found",
        type: "NotFoundError",
      };
    }

    event = event[0];

    // check event is registered on another platform
    if (event.otherPlatformUrl && event.otherPlatformUrl !== "") {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event is already registered on another platform",
        type: "ValidationError",
      };
    }

    // check event already registered
    const alreadyRegistered = await ticketService.getTicketService({
      eventId: new ObjectId(req.body.eventId),
      userId: new ObjectId(req.user._id),
    });

    if (alreadyRegistered.length > 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "You have already registered for this event",
        type: "ValidationError",
      };
    }

    const inTeam = await ticketService.checkWhetherUserIsRegisteredInEventService(
      req.user.espektroId,
      new ObjectId(req.body.eventId),    
    );

    if (inTeam.length > 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "You have already registered for this event",
        type: "ValidationError",
      };
    }

    // check event has already ended
    if (
      new Date(event.endTime) < new Date(moment("YYYY-MM-DD HH:mm:ss").format())
    ) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event has already ended",
        type: "ValidationError",
      };
    }

    if (event.eventClosed) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Event registration is full. Please come again next time",
        type: "ValidationError",
      };
    }

    // check event type - group or individual
    if (event.eventType === "group") {
      const teamMembersArray: any = [];
      teamMembersArray.push({
        name: req.user.name,
        espektroId: req.user.espektroId,
        designation: "Team Leader",
      });

      // check if team is present in request
      if (!req.body.team) {
        throw {
          statusObj: BAD_REQUEST,
          name: "This is a team event. Team is required",
          type: "ValidationError",
        };
      }

      // check if enough team members are present in request
      if (req.body.team.members.length + 1 > event.eventMaxParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Team size exceeded",
          type: "ValidationError",
        };
      }
      if (req.body.team.members.length + 1 < event.eventMinParticipants) {
        throw {
          statusObj: BAD_REQUEST,
          name: "Team size is less than minimum",
          type: "ValidationError",
        };
      }

      // check if the team member espektroId is valid
      for (const teamMember of req.body.team.members) {
        const user: any = await userService.findUserService({
          espektroId: teamMember.espektroId,
        });
        if (!user || user.length === 0) {
          throw {
            statusObj: BAD_REQUEST,
            name: "User of Espektro ID " + teamMember.espektroId + "not found",
            type: "NotFoundError",
          };
        }
        const inTeam:any = await ticketService.checkWhetherUserIsRegisteredInEventService(
          teamMember.espektroId,
          new ObjectId(req.body.eventId),
        );

        if (inTeam.length > 0) {
          throw {
            statusObj: BAD_REQUEST,
            name: "User of Espektro ID " + teamMember.espektroId + " already registered for this event",
            type: "ValidationError",
          };
        }
        // final team members array
        teamMembersArray.push({
          name: user.name,
          espektroId: user.espektroId,
          designation: "Team Member",
        });
      }

      req.body.team.members = teamMembersArray;
    }

    // check college
    const college = req.user.college;
    const kgecNames = [
      "kalyani government engineering college",
      "Kalyani Government Engineering college, kalyani",
      "kgec",
      "kalyani govt. engineering college",
      "kalyani govt. engg. college",
    ];

    let toPayForEvent = 0;

    // check if user is from kgec
    if (kgecNames.includes(college.toLowerCase().trim())) {
      toPayForEvent = !event.eventPriceForKGEC ? 0 : event.eventPriceForKGEC;
    } else {
      toPayForEvent = event.eventPrice;
    }

    // check if user has enough coins
    if (toPayForEvent > 0 && req.user.coins < toPayForEvent) {
      throw {
        statusObj: BAD_REQUEST,
        name: "You do not have enough coins to register for this event",
        type: "ValidationError",
      };
    }
    req.body.userId = req.user._id;
    const ticket: any = await ticketService.createTicketService(req.body);

    const return_object: any = {
      ticket: ticket,
      coinsSpent: toPayForEvent,
    };

    // update user coins
    await userService.updateUserService(req.user._id, {
      coins: req.user.coins - toPayForEvent,
    });

    // create payment log
    await createPaymentLogService({
      logType: "COINS_USED",
      userId: new ObjectId(req.user._id),
      coins: event.eventPrice,
      description: `${req.user.name} used ${toPayForEvent} coins to register for event ${event.title}`,
    });

    // create log
    await createLogService({
      logType: "EVENT_REGISTERED",
      userId: new ObjectId(req.user._id),
      description: `${req.user.name} registered for event ${event.title}`,
    });

    messageCustom(res, OK, "Event registered successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// password checkin for individual event
const eventCheckIn = async (req: any, res: any) => {
  try {
    // check if event exists
    const user: any = await userService.findUserService({
      espektroId: req.body.espektroId,
    });

    if (!user || user.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "User of Espektro ID " + req.body.espektroId + " not found",
        type: "NotFoundError",
      };
    }

    // check if user has registered for the event
    let ticket: any = await ticketService.getTicketService({
      eventId: new ObjectId(req.body.eventId),
      userId: new ObjectId(user._id),
    });

    if (ticket.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "User of Espektro ID " + req.body.espektroId + " not found",
        type: "NotFoundError",
      };
    }

    ticket = ticket[0];

    // check if user checkin is already done
    if (!ticket.checkedIn) {
      throw {
        statusObj: BAD_REQUEST,
        name:
          "User of Espektro ID " +
          req.body.espektroId +
          " still not checked in for this event",
        type: "NotFoundError",
      };
    }

    // check if password matches
    if (String(req.body.password) !== String(ticket.ticketNumber)) {
      throw {
        statusObj: BAD_REQUEST,
        name: "Invalid password",
        type: "ValidationError",
      };
    }

    const return_object: any = {
      ticket: ticket,
    };

    return_object.user = Object.assign({}, user)["_doc"];
    delete return_object.user.password;

    messageCustom(res, OK, "User logged in successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// get participants from event
const getParticipantsfromEvent = async (req: any, res: any) => {
  try {
    const events: any = await ticketService.getParticipantsfromEventService(
      new ObjectId(req.params.id),
    );
    const return_object: any = {
      events: events,
    };

    messageCustom(res, OK, "Event fetched successfully", return_object);
  } catch (err) {
    await handleError(req, res, err);
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
  getParticipantsfromEvent,
};
