import { Router } from "express";
import { authorize as utilAuthorize } from "../middlewares/util.authorization";
import utilsController from "../controllers/util.controller";
import multer from "multer";
const upload = multer({ dest: "./uploads/" });

const router = Router();

router
  .route("/uploadimages")
  .put(utilAuthorize(), upload.array("images"), utilsController.uploadImages);

export default router;
