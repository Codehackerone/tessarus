export const OK: any = {
  statusCode: 200,
  statusMessage: "OK",
};

export const CREATED: any = {
  statusCode: 201,
  statusMessage: "Created",
};

export const BAD_REQUEST: any = {
  statusCode: 400,
  statusMessage: "Bad Request. Please check your request.",
};

export const UNAUTHORIZED: any = {
  statusCode: 401,
  statusMessage: "Unauthorized. Please check your credentials.",
};

export const FORBIDDEN: any = {
  statusCode: 403,
  statusMessage: "Forbidden. You are not allowed to access this resource.",
};

export const NOT_FOUND: any = {
  statusCode: 404,
  statusMessage: "Not Found. The resource you are looking for is not found.",
};

export const CONFLICT: any = {
  statusCode: 409,
  statusMessage:
    "Conflict. The resource you are trying to access is already in use.",
};

export const SERVER_ERROR: any = {
  statusCode: 500,
  statusMessage: "Internal Server Error. Please try again later.",
};

export const BAD_GATEWAY: any = {
  statusCode: 502,
  statusMessage: "Bad Gateway. Please try again later.",
};
