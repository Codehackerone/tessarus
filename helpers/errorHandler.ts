import { messageError } from "../helpers/message";
import { alert } from "../helpers/webhookAlert";
import { BAD_REQUEST, CONFLICT, SERVER_ERROR } from "../helpers/messageTypes";

export const handleError = async (req: any, res: any, err: any) => {
  if (err.error === "ValidationError") {
    messageError(res, BAD_REQUEST, err.message, err.name);
  } else if (err.code && Number(err.code) === 11000) {
    messageError(
      res,
      CONFLICT,
      `${Object.keys(err.keyValue)[0]} '${
        Object.values(err.keyValue)[0]
      }' already exists.`,
      err.name,
    );
  } else if (err.statusObj !== undefined) {
    messageError(res, err.statusObj, err.name, err.type);
  } else if (err.name === "BSONTypeError") {
    messageError(res, BAD_REQUEST, err.message, "MongoError");
  } else if (err.name === "CastError") {
    messageError(res, BAD_REQUEST, err.message, "MongoError");
  } else {
    console.log(err);
    alert(req.originalUrl, JSON.stringify(err));
    messageError(res, SERVER_ERROR, err.message, err.name);
  }
};
