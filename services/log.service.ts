import Logs from "../models/logs.model";

export const createLogService = async (logBody: any) => {
  const log = await Logs.Log.create(logBody);
  return log;
};

export const getAllLogsService = async () => {
  const logs = await Logs.Log.find();
  return logs;
};

export const createPaymentLogService = async (logBody: any) => {
  const log = await Logs.paymentLog.create(logBody);
  return log;
};

export const getAllPaymentLogsService = async () => {
  const logs = await Logs.paymentLog.find();
  return logs;
};
