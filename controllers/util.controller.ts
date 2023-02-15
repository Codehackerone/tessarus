import { messageCustom } from "../helpers/message";
import { CREATED, BAD_REQUEST } from "../helpers/messageTypes";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import { createLogService } from "../services/log.service";
import { handleError } from "../helpers/errorHandler";

const uploadImages = async (req: any, res: any) => {
  try {
    // eslint-disable-next-line prefer-const
    let imagesArray: any = [];

    if (req.files.length === 0) {
      throw {
        statusObj: BAD_REQUEST,
        name: "No files were uploaded",
        type: "ValidationError",
      };
    }

    for (const file of req.files) {
      const result = await uploadFile(file);
      imagesArray.push(result.Location);
      fs.unlinkSync("./uploads/" + file.filename);
    }

    await createLogService({
      logType: "IMAGES_UPLOADED",
      description: `Images uploaded by IP: ${req.ip}`,
    });

    const return_object: any = {
      images: imagesArray,
    };

    messageCustom(res, CREATED, "Images added successfully", return_object);
  } catch (err: any) {
    await handleError(req, res, err);
  }
};

export default {
  uploadImages,
};
