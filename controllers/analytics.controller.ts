import { OK } from "../helpers/messageTypes";
import { messageCustom } from "../helpers/message";
import { handleError } from "../helpers/errorHandler";
import analyticsService from "../services/analytics.service";

// analytics route to get all event organizer clubs

const getEventOrganizerClubs = async (req: any, res: any) => {
  try {
    const clubs: any = await analyticsService.getEventOrganizerClubsService();

    messageCustom(res, OK, "Clubs fetched successfully", clubs);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

// analytics route to get user analytics

const getUserAnalytics = async (req: any, res: any) => {
  try {
    const params = req.query;
    const UserAnalytics = await analyticsService.getUserAnalyticsService(
      params,
    );
    messageCustom(res, OK, "User Analytics", UserAnalytics);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getNumLogs = async (req: any, res: any) => {
  try {
    const logs = await analyticsService.getNumLogsService();
    messageCustom(res, OK, "Logs fetched successfully", logs);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

const getEventAnalytics = async (req: any, res: any) => {
  try {
    const eventAnalytics = await analyticsService.getEventAnalyticsService();
    const returnObject = {
      eventAnalytics,
    };
    messageCustom(res, OK, "Event Analytics", returnObject);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

export default {
  getEventOrganizerClubs,
  getUserAnalytics,
  getNumLogs,
  getEventAnalytics,
};
