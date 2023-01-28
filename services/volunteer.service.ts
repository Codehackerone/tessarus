import Volunteer from "../models/volunteer.model";

const addVolunteerService = async (volunteer: any) => {
    const newUser = new Volunteer(volunteer);
    return newUser.save();
};

const findVolunteerService = async (volunteer: any) => {
    return Volunteer.findOne(volunteer);
};

export default {
    addVolunteerService,
    findVolunteerService
}