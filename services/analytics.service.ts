import Logs from "../models/logs.model";
import User from "../models/user.model";
import Event from "../models/event.model";

const getNumLogsService = async () => {
  // get total number of logs
  const totalLogs = await Logs.Log.countDocuments({});

  // also get the number of each logType
  const totalLogTypes = await Logs.Log.aggregate([
    {
      $group: {
        _id: "$logType",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalPaymentLogs = await Logs.paymentLog.countDocuments({});
  const totalPaymentLogTypes = await Logs.paymentLog.aggregate([
    {
      $group: {
        _id: "$logType",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    "Total Number of Logs": totalLogs,
    "Log Types": totalLogTypes,
    "Total Number of Payment Logs": totalPaymentLogs,
    "Payment Log Types": totalPaymentLogTypes,
  };
};

const getUserAnalyticsService = async (params: any) => {
  const pipeline = [];

  if (params.college) {
    pipeline.push({ $match: { college: params.college } });
  }

  if (params.degree) {
    pipeline.push({ $match: { degree: params.degree } });
  }

  if (params.year) {
    pipeline.push({ $match: { year: params.year } });
  }

  if (params.stream) {
    pipeline.push({ $match: { stream: params.stream } });
  }

  if (params.gender) {
    params.gender =
      params.gender.charAt(0).toUpperCase() + params.gender.slice(1);
    pipeline.push({ $match: { gender: params.gender } });
  }

  if (params.verified) {
    params.verified = params.verified === "true" ? true : false;
    pipeline.push({ $match: { verified: params.verified } });
  }

  pipeline.push({
    $group: {
      _id: null,
      total: { $sum: 1 },
    },
  });

  pipeline.push({
    $project: {
      _id: 0,
    },
  });
  const user_data = await User.aggregate(pipeline);

  // eslint-disable-next-line prefer-const
  let totalParamList: any = {
    college: (await User.distinct("college")) || [],
    degree: (await User.distinct("degree")) || [],
    year: (await User.distinct("year")) || [],
    stream: (await User.distinct("stream")) || [],
  };

  for (const param in totalParamList) {
    const paramList = totalParamList[param];
    const paramCountList = [];
    for (let i = 0; i < paramList.length; i++) {
      const paramCount = await User.countDocuments({ [param]: paramList[i] });
      // eslint-disable-next-line prefer-const
      let dictCount: any = {};
      dictCount[paramList[i]] = paramCount;
      paramCountList.push(dictCount);
    }
    totalParamList[param] = paramCountList;
  }

  const result = {
    params: params,
    total: user_data[0].total,
    totalParamList: totalParamList,
  };

  return result;
};

const getEventOrganizerClubsService = async () => {
  const clubs = await Event.distinct("eventOrganiserClub.name");
  const numClubs = clubs.length;

  return {
    clubs,
    //fullClubs,
    "Number of clubs": numClubs,
  };
};

const getEventAnalyticsService = async () => {
  const events: Array<any> = await Event.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "_id",
        foreignField: "eventId",
        as: "tickets",
      },
    },
    {
      $addFields: {
        numTickets: { $size: "$tickets" },
      },
    },
    {
      $project: {
        title: 1,
        numTickets: 1,
      },
    },
  ]);
  return events;
};

export default {
  getEventOrganizerClubsService,
  getUserAnalyticsService,
  getNumLogsService,
  getEventAnalyticsService,
};
