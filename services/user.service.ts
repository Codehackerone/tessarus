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

const updateUserService = async (userId: any, userBody: any) => {
  let user: any = await User.findByIdAndUpdate(userId, userBody);
  return user;
};

const resetPasswordService = async (userId: any, newPassword: any) => {
  let user: any = await User.findById(userId);
  user.password = newPassword;
  await user.save();
};

export default {
  signUpService,
  findUserService,
  verifyToken,
  updateUserService,
  resetPasswordService,
};