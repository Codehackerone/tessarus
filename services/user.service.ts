import User from "../models/user.model";

const signUpService = async (userBody: any) => {
  const user = await User.create(userBody);
  return user;
};

const findUserService = async (param: any) => {
  var user = await User.findOne(param);
  return user;
};

const verifyToken = async (userBody: any) => {
  let user: any = await User.findByIdAndUpdate(userBody._id, {
    verified: true,
  });
  return user;
};

export default {
  signUpService,
  findUserService,
  verifyToken,
};
