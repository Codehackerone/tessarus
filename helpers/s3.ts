// Importing the dotenv package to handle environmental variables, the S3 module from AWS SDK and file system (fs) module
import { config } from "dotenv";
import S3 from "aws-sdk/clients/s3.js";
import fs from "fs";

// Loading environment variables from .env file
config();

// Extracting necessary AWS configuration details from the environment variables
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.S3_AWS_ACCESS_KEY;
const secretAccessKey = process.env.S3_AWS_SECRET_KEY;

// Configuring the S3 client with specified credentials
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// Defining a function to upload files asynchronously
export const uploadFile = async (file: any) => {
  // Creating a stream of the file to be uploaded
  const fileStream = fs.createReadStream(file.path);

  // Configuring parameters for the upload request
  const uploadParams: any = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  // "promise()" method is used as S3.upload() returns a promise.
  // Uploading the file to AWS S3 using the configured S3 client
  return s3.upload(uploadParams).promise();
};
