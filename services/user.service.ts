import User from "../models/user.model";
import Event from "../models/event.model";
import { Transaction } from "../models/user.model";
import axios from "axios";

const signUpService = async (userBody: any) => {
  const user = await User.create(userBody);
  return user;
};

const findUserService = async (param: any) => {
  const user = await User.findOne(param);
  return user;
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

const getTransactionByUserIdService = async (userId: any) => {
  return await Transaction.find({ userId: userId });
};

const createTransactionService = async (transactionBody: any) => {
  return await Transaction.create(transactionBody);
};

const updateTransactionService = async (
  transactionId: any,
  transactionBody: any,
) => {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    transactionBody,
    {
      new: true,
    },
  );
  await updateTransactionFromRazorpayService(transactionId);
  return transaction;
};

const refreshTransactionService = async (transactionId: any) => {
  const transaction: any = await Transaction.findById(transactionId);
  if (transaction.paymentId) {
    await updateTransactionFromRazorpayService(transactionId);
  }
};

const updateTransactionFromRazorpayService = async (transactionId: any) => {
  const transaction: any = await Transaction.findById(transactionId);
  if (!transaction.paymentId) {
    return;
  }
  if (
    transaction.status === "authorized" ||
    transaction.status === "captured"
  ) {
    return;
  }
  const config: any = {
    method: "get",
    url: `https://api.razorpay.com/v1/payments/${transaction.paymentId}`,
    headers: {
      Authorization: `Basic ${process.env.RAZORPAY_KEY}`,
    },
  };
  const response: any = await axios(config);
  if (
    response.data.status === "authorized" ||
    response.data.status === "captured"
  ) {
    const user = await User.findById(transaction.userId);
    if (user) {
      transaction.status = response.data.status;
      await transaction.save();
      await User.findByIdAndUpdate(transaction.userId, {
        coins: user.coins + Number(transaction.coins),
      });
    }
    return;
  }

  transaction.status = response.data.status;
  return await transaction.save();
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
  createTransactionService,
  updateTransactionService,
  refreshTransactionService,
};
