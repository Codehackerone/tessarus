import User from "../models/user.model";

export const signUpService = async (userBody: any) => {
  const user = await User.create(userBody);
  return user;
};

export const findUserService = async (param: any) => {
  var user = await User.findOne(param);
  return user;
};