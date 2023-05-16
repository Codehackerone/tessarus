// Define message function which takes in response object, messageType object and response message string.
export const message = function (res: any, messageType: any, message: string) {
  // Initialize a return object with the `message` property set to the input message.
  let return_object: any = {
    message: message,
  };
  // Using the Object.assign method, merge the properties from the messageType object into the return_object.
  return_object = Object.assign(return_object, messageType);
  // Send JSON response with status code derived from the statusCode field of the messageType object and the return_object.
  res.status(messageType.statusCode).json(return_object);
};

// Define messageError function which takes in response object, messageType object, message string and error object.
export const messageError = function (
  res: any,
  messageType: any,
  message: string,
  err: any,
) {
  // Initialize a return object with the `message` and `error` properties set to the input message and error object respectively.
  let return_object: any = {
    message: message,
    error: err,
  };
  // Using the Object.assign method, merge the properties from the messageType object into the return_object.
  return_object = Object.assign(return_object, messageType);
  // Send JSON response with status code derived from the statusCode field of the messageType object and the return_object.
  res.status(messageType.statusCode).json(return_object);
};

// Define messageCustom function which takes in response object, messageType object, message string and a return object.
export const messageCustom = function (
  res: any,
  messageType: any,
  message: string,
  return_object: any,
) {
  // Set the `message` property of the input return object to the input message.
  return_object.message = message;
  // Using the Object.assign method, merge the properties from the messageType object into the return_object.
  return_object = Object.assign(return_object, messageType);
  // Send JSON response with status code derived from the statusCode field of the messageType object and the return_object.
  res.status(messageType.statusCode).json(return_object);
};
