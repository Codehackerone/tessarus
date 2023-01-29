import Volunteer from "../models/volunteer.model";

const addVolunteerService = async (volunteer: any) => {
  const newUser = new Volunteer(volunteer);
  return newUser.save();
};

const findVolunteerService = async (volunteer: any) => {
  return Volunteer.findOne(volunteer);
};

const findAllVolunteersService = async () => {
  return Volunteer.find().select("-password");
};

const updateVolunteerService = async (volunteerId: any, volunteer: any) => {
  return Volunteer.findByIdAndUpdate(volunteerId, volunteer, { new: true });
};

export default {
  addVolunteerService,
  findVolunteerService,
  findAllVolunteersService,
  updateVolunteerService,
};
