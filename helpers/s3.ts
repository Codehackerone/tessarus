import { config } from "dotenv";
import S3 from "aws-sdk/clients/s3.js";
import fs from "fs";

config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.S3_AWS_ACCESS_KEY;
const secretAccessKey = process.env.S3_AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export const uploadFile = async (file: any) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams: any = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
    ACL: "public-read",
  };
  return s3.upload(uploadParams).promise();
};
