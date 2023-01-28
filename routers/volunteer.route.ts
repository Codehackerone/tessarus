import express from "express";
import volunteerController from "../controllers/volunteer.controller";

const Router = express.Router();

// Get all users - /allusers - GET (minAccessLevel: 4)

// Get all logs - /alllogs - GET (minAccessLevel: 4)

// Get all volunteers - /all - GET (minAccessLevel: 3)

// Get volunteer by id - /:id - GET (minAccessLevel: 4)

// Create volunteer - /create - POST (minAccessLevel: 4)

// Update volunteer - /update - PUT (minAccessLevel: 4)

// Delete volunteer - /delete - DELETE (minAccessLevel: 4)

// Scan user qr - /userqrscan - GET (minAccessLevel: 1)

// update Coins - /updatecoins - PUT (minAccessLevel: 2)



export default Router;