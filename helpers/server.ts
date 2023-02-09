import express from "express";
import { message } from "./message";
import { OK } from "./messageTypes";

function createServer() {
  const app = express();

  app.use(express.json());

  app.get("/", (req: any, res: any) => {
    message(res, OK, "Welcome to tessarus API system");
  });

  return app;
}

export default createServer;
