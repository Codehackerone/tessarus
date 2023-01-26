import Logs from "../models/logs.model";

export const createLogService = async (logBody: any) => {
  const log = await Logs.create(logBody);
  return log;
};
