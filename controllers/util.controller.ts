import { messageCustom, messageError } from "../helpers/message";
import { CREATED, BAD_REQUEST, SERVER_ERROR } from "../helpers/messageTypes";
import { uploadFile } from "../helpers/s3";
import fs from "fs";
import { createLogService } from "../services/log.service";
import { alert } from "../helpers/webhookAlert";

const uploadImages = async (req: any, res: any) => {
  try {
    // eslint-disable-next-line prefer-const
    let imagesArray: any = [];

    if (req.files.length === 0) {
      messageError(res, BAD_REQUEST, "No files were uploaded", "No files");
      return;
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
    if (err.error === "ValidationError") {
      messageError(res, BAD_REQUEST, err.message, err.name);
    } else {
      console.log(err);
      alert(req.originalUrl, JSON.stringify(err));
      messageError(res, SERVER_ERROR, err.message, err.name);
    }
  }
};

export default {
  uploadImages,
};
