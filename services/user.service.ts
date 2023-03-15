import User from "../models/user.model";
import Event from "../models/event.model";
import { Transaction } from "../models/user.model";

const signUpService = async (userBody: any) => {
  const user = await User.create(userBody);
  return user;
};

const findUserService = async (param: any) => {
  const user = await User.findOne(param);
  return user;
};

const getTransactionByUserIdService = async (userId: any) => {
  return await Transaction.find({ userId: userId });
};

const verifyToken = async (userBody: any) => {
  const user: any = await User.findByIdAndUpdate(userBody._id, {
    verified: true,
  });
  return user;
};

const updateUserService = async (userId: any, userBody: any) => {
  const user: any = await User.findByIdAndUpdate(userId, userBody, {
    new: true,
  });
  return user;
};

const resetPasswordService = async (userId: any, newPassword: any) => {
  const user: any = await User.findById(userId);
  user.password = newPassword;
  await user.save();
};

const getAllUsersService = async () => {
  const users: any = await User.find().select("-password");
  return users;
};

const fetchEspekroIdService = async (espektroId: any) => {
  return await User.find({ espektroId: espektroId }).select(
    "name email espektroId college degree year stream -_id",
  );
};

const addReferralCodeService = async (userId: any, referralCode: string) => {
  return await User.findByIdAndUpdate(userId, { referralCode: referralCode });
};

const updatePrizeWinnerService = async (
  userId: any,
  eventName: string,
  eventId: any,
  position: number,
  prize: string,
) => {
  const user: any = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        eventWinList: {
          eventName: eventName,
          eventId: eventId,
          position: position,
          prize: prize,
        },
      },
    },
    { new: true },
  );
  await Event.findByIdAndUpdate(eventId, {
    $push: {
      eventWinList: {
        userId: userId,
        userName: user.name,
        userCollege: user.college,
        position: position,
        prize: prize,
      },
    },
  });
  return user;
};

export default {
  signUpService,
  findUserService,
  verifyToken,
  updateUserService,
  resetPasswordService,
  getAllUsersService,
  fetchEspekroIdService,
  addReferralCodeService,
  updatePrizeWinnerService,
  getTransactionByUserIdService,
};
