import Logs from "../models/logs.model";
import { paginate } from "../helpers/paginate";

export const createLogService = async (logBody: any) => {
  const log = await Logs.Log.create(logBody);
  return log;
};

export const getAllLogsService = async () => {
  const logs: any = await paginate(Logs.Log, {}, 1, 20, { createdAt: -1 });
  return logs;
};

export const createPaymentLogService = async (logBody: any) => {
  const log = await Logs.paymentLog.create(logBody);
  return log;
};

export const getAllPaymentLogsService = async () => {
  const logs: any = await paginate(Logs.Log, {}, 1, 20, { createdAt: -1 });
  return logs;
};
