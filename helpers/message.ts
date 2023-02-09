export const message = function (res: any, messageType: any, message: string) {
  let return_object: any = {
    message: message,
  };
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};

export const messageError = function (
  res: any,
  messageType: any,
  message: string,
  err: any,
) {
  let return_object: any = {
    message: message,
    error: err,
  };
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};

export const messageCustom = function (
  res: any,
  messageType: any,
  message: string,
  return_object: any,
) {
  return_object.message = message;
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};
