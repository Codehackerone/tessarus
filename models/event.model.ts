import mongoose from "mongoose";
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  tagLine:{
    type: String,
  },
  startTime:{
    type: Date,
    required: true
  },
  endTime:{
    type: Date,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  eventImages:[
    {
      type: String,
    }
  ],
  eventType:{
    type: String,
    required: true,
    enum:["solo", "group"]
  },
  eventMinParticipants:{
    type: Number,
  },
  eventMaxParticipants:{
    type: Number,
  },
  eventPrice:{
    type: Number,
    required: true
  },
  eventOrganiserClub:{
    name:{
      type: String,
      required: true
    },
    image:{
      type: String,
      required: true
    }
  },
  eventCoordinators:[
    {
      name:{
        type: String,
        required: true
      },
      image:{
        type: String,
        required: true
      },
      phone:{
        type: String,
        required: true  
      }
    }
  ]
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
