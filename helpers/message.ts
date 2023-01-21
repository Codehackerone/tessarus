export const message = function (res: any, messageType: any, message: String) {
  var return_object: any = {
    message: message,
  };
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};

export const messageError = function (
  res: any,
  messageType: any,
  message: String,
  err: any
) {
  var return_object: any = {
    message: message,
    error: err,
  };
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};

export const messageCustom = function (
  res: any,
  messageType: any,
  message: String,
  return_object: any
) {
  return_object.message = message;
  return_object = Object.assign(return_object, messageType);
  res.status(messageType.statusCode).json(return_object);
};
